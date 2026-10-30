/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { transaction, Model, raw } from 'objection';
import RowPlanModel from '../models/rowPlanModel.js';
import FieldRowModel from '../models/fieldRowModel.js';
import TaskRowModel from '../models/taskRowModel.js';
import {
  RowPlanError,
  MAX_ROWS,
  parseRowPlanGeoJSON,
  parseRowSpec,
  computeMapHash,
  rowsOutsideField,
  buildRowPlanGeoJSON,
} from '../util/rowPlan.js';

const RESULT_STATUSES = ['done', 'aborted'];
const ADMIN_ROLES = [1, 2, 5];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIQUE_VIOLATION = '23505';

const sendError = (res, error) => {
  if (error instanceof RowPlanError) return res.status(error.status).json({ error: error.message });
  if (error?.nativeError?.code === UNIQUE_VIOLATION || error?.code === UNIQUE_VIOLATION) {
    return res.status(409).json({ error: 'a plan with this map_id already exists' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};

const getFieldArea = (farm_id, location_id) =>
  Model.knex()('location')
    .join('figure', 'figure.location_id', 'location.location_id')
    .join('area', 'area.figure_id', 'figure.figure_id')
    .where({
      'location.location_id': location_id,
      'location.farm_id': farm_id,
      'location.deleted': false,
    })
    .whereIn('figure.type', ['field', 'garden'])
    .first('location.location_id', 'area.grid_points');

const getLivePlan = (farm_id, row_plan_id) =>
  RowPlanModel.query().whereNotDeleted().where({ farm_id, row_plan_id }).first();

/**
 * Rows on a task can be set by owners, managers and extension officers, or by the worker the task is assigned to.
 * Throws RowPlanError when the task is missing, deleted, abandoned (or complete, unless allowComplete).
 */
const getWritableTask = async (req, task_id, { allowComplete }) => {
  const task = await Model.knex()('task')
    .where({ task_id })
    .first('task_id', 'deleted', 'complete_date', 'abandon_date', 'assignee_user_id');
  if (!task || task.deleted) throw new RowPlanError('task not found', 404);
  if (!ADMIN_ROLES.includes(req.role) && task.assignee_user_id !== req.auth?.user_id) {
    throw new RowPlanError(
      'only the assigned worker or an admin can change rows on this task',
      403,
    );
  }
  if (task.abandon_date) throw new RowPlanError('task is abandoned', 409);
  if (!allowComplete && task.complete_date) throw new RowPlanError('task is complete', 409);
  return task;
};

const rowPlanController = {
  /**
   * POST /row_plan/import   body: { location_id, geojson, supersedes_row_plan_id? }
   * Robot plans (map_id + map_hash) are checked against a recomputed hash and must lie inside the field.
   * Re-importing the same map_id with the same hash returns the existing plan.
   */
  importRowPlan() {
    return async (req, res) => {
      const { farm_id } = req.headers;
      const { location_id, geojson, supersedes_row_plan_id } = req.body;
      const context = { user_id: req.auth?.user_id };
      let trx;
      try {
        if (supersedes_row_plan_id != null && !UUID_PATTERN.test(String(supersedes_row_plan_id))) {
          throw new RowPlanError('supersedes_row_plan_id must be a uuid');
        }
        const { properties, rows } = parseRowPlanGeoJSON(geojson);
        if (properties.field_location_id && properties.field_location_id !== location_id) {
          throw new RowPlanError('field_location_id in the file does not match location_id');
        }
        const field = await getFieldArea(farm_id, location_id);
        if (!field) throw new RowPlanError('location_id must be a field or garden on this farm');

        const warnings = [];
        const outside = rowsOutsideField(rows, field.grid_points);
        if (outside.length) {
          const message = `rows outside the field: ${outside.slice(0, 20).join(', ')}${
            outside.length > 20 ? ', ...' : ''
          }`;
          if (properties.source === 'robot') throw new RowPlanError(message);
          warnings.push(message);
        }

        if (properties.source === 'robot') {
          if (computeMapHash(rows) !== properties.map_hash) {
            throw new RowPlanError('map_hash does not match the rows in the file');
          }
          const existing = await RowPlanModel.query()
            .whereNotDeleted()
            .where({ farm_id, map_id: properties.map_id })
            .first();
          if (existing) {
            if (existing.map_hash === properties.map_hash && existing.location_id === location_id) {
              return res.status(200).send({ row_plan: existing, warnings });
            }
            return res
              .status(409)
              .json({ error: 'map_id already exists with different rows or field' });
          }
        }

        let superseded = null;
        if (properties.source === 'robot' && properties.supersedes) {
          superseded = await RowPlanModel.query()
            .whereNotDeleted()
            .where({ farm_id, map_id: properties.supersedes })
            .first();
          if (!superseded) {
            throw new RowPlanError(
              `supersedes: no plan with map_id ${properties.supersedes} on this farm`,
            );
          }
        } else if (supersedes_row_plan_id) {
          superseded = await getLivePlan(farm_id, supersedes_row_plan_id);
          if (!superseded) throw new RowPlanError('supersedes_row_plan_id not found on this farm');
        }
        if (superseded && superseded.location_id !== location_id) {
          throw new RowPlanError('a plan can only supersede a plan for the same field');
        }
        if (superseded?.superseded_at) {
          throw new RowPlanError('the plan to supersede is already superseded', 409);
        }

        trx = await transaction.start(Model.knex());
        const row_plan = await RowPlanModel.query(trx)
          .context(context)
          .insert({
            farm_id,
            location_id,
            source: properties.source,
            map_id: properties.map_id,
            map_hash: properties.map_hash,
            inputs_hash: properties.inputs_hash,
            schema_version: 1,
            generator: properties.generator,
            origin: properties.origin,
            params: properties.params,
            supersedes_row_plan_id: superseded?.row_plan_id ?? null,
            supersedes_map_id: properties.supersedes ?? superseded?.map_id ?? null,
          })
          .returning('*');
        await FieldRowModel.query(trx)
          .context(context)
          .insert(rows.map((row) => ({ ...row, row_plan_id: row_plan.row_plan_id })));
        if (superseded && !superseded.superseded_at) {
          await RowPlanModel.query(trx)
            .context(context)
            .patch({ superseded_at: new Date().toISOString() })
            .where({ row_plan_id: superseded.row_plan_id });
        }
        await trx.commit();
        return res.status(201).send({ row_plan, row_count: rows.length, warnings });
      } catch (error) {
        if (trx) await trx.rollback();
        return sendError(res, error);
      }
    };
  },

  /** GET /row_plan/farm/:farm_id?location_id=&include_superseded=true */
  listRowPlans() {
    return async (req, res) => {
      try {
        const { farm_id } = req.params;
        const { location_id, include_superseded } = req.query;
        const query = RowPlanModel.query()
          .whereNotDeleted()
          .select(
            'row_plan.*',
            raw(
              '(select count(distinct field_row.row_number) from field_row where field_row.row_plan_id = row_plan.row_plan_id and field_row.deleted = false)::int as row_count',
            ),
          )
          .where({ 'row_plan.farm_id': farm_id })
          .orderBy('row_plan.created_at', 'desc');
        if (location_id) query.where({ 'row_plan.location_id': location_id });
        if (include_superseded !== 'true') query.whereNull('row_plan.superseded_at');
        return res.status(200).send(await query);
      } catch (error) {
        return sendError(res, error);
      }
    };
  },

  /** GET /row_plan/:row_plan_id */
  getRowPlan() {
    return async (req, res) => {
      try {
        const plan = await getLivePlan(req.headers.farm_id, req.params.row_plan_id);
        if (!plan) return res.sendStatus(404);
        const rows = await FieldRowModel.query()
          .whereNotDeleted()
          .where({ row_plan_id: plan.row_plan_id })
          .orderBy('position');
        return res.status(200).send({ ...plan, rows });
      } catch (error) {
        return sendError(res, error);
      }
    };
  },

  /** GET /row_plan/:row_plan_id/geojson */
  exportRowPlan() {
    return async (req, res) => {
      try {
        const plan = await getLivePlan(req.headers.farm_id, req.params.row_plan_id);
        if (!plan) return res.sendStatus(404);
        const rows = await FieldRowModel.query()
          .whereNotDeleted()
          .where({ row_plan_id: plan.row_plan_id })
          .orderBy('position');
        const field = await getFieldArea(plan.farm_id, plan.location_id);
        res.type('application/geo+json');
        return res.status(200).send(buildRowPlanGeoJSON(plan, rows, field?.grid_points ?? null));
      } catch (error) {
        return sendError(res, error);
      }
    };
  },

  /**
   * PUT /row_plan/task/:task_id/rows   body: { row_plan_id, row_numbers: [12, 13] } or { row_plan_id, rows: "12-18,21" }
   * Replaces the rows on a task. Refused once any of the task's rows is done or aborted.
   */
  setTaskRows() {
    return async (req, res) => {
      const { farm_id } = req.headers;
      const { task_id } = req.params;
      const { row_plan_id, row_numbers, rows } = req.body;
      const context = { user_id: req.auth?.user_id };
      let trx;
      try {
        if (!UUID_PATTERN.test(String(row_plan_id))) {
          throw new RowPlanError('row_plan_id must be a uuid');
        }
        let numbers;
        if (Array.isArray(row_numbers)) {
          if (
            !row_numbers.length ||
            row_numbers.length > MAX_ROWS ||
            !row_numbers.every((n) => Number.isInteger(n) && n >= 0)
          ) {
            throw new RowPlanError(
              `row_numbers must be a list of up to ${MAX_ROWS} non-negative integers`,
            );
          }
          numbers = [...new Set(row_numbers)].sort((a, b) => a - b);
        } else {
          numbers = parseRowSpec(rows);
        }
        const plan = await getLivePlan(farm_id, row_plan_id);
        if (!plan) throw new RowPlanError('row_plan_id not found on this farm');
        if (plan.superseded_at) {
          throw new RowPlanError('this plan is superseded, use its replacement', 409);
        }
        await getWritableTask(req, task_id, { allowComplete: false });
        const taskLocations = await Model.knex()('location_tasks')
          .where({ task_id })
          .pluck('location_id');
        if (!taskLocations.includes(plan.location_id)) {
          throw new RowPlanError('the task is not on the field this plan belongs to');
        }
        const fieldRows = await FieldRowModel.query()
          .whereNotDeleted()
          .where({ row_plan_id })
          .whereIn('row_number', numbers);
        const found = new Set(fieldRows.map((r) => r.row_number));
        const missing = numbers.filter((n) => !found.has(n));
        if (missing.length) {
          throw new RowPlanError(`rows not in this plan: ${missing.slice(0, 20).join(', ')}`);
        }
        const started = await TaskRowModel.query()
          .whereNotDeleted()
          .where({ task_id })
          .whereNot({ status: 'pending' })
          .first();
        if (started) throw new RowPlanError('rows on this task already have a result', 409);

        trx = await transaction.start(Model.knex());
        // Replace the set outright. Soft-deleted rows would keep the primary key.
        await trx('task_row').where({ task_id }).del();
        await TaskRowModel.query(trx)
          .context(context)
          .insert(
            fieldRows.map((r) => ({
              task_id: Number(task_id),
              row_id: r.row_id,
              status: 'pending',
            })),
          );
        await trx.commit();
        return res
          .status(200)
          .send({ task_id: Number(task_id), row_plan_id, row_numbers: numbers });
      } catch (error) {
        if (trx) await trx.rollback();
        return sendError(res, error);
      }
    };
  },

  /** GET /row_plan/task/:task_id/rows */
  getTaskRows() {
    return async (req, res) => {
      try {
        const rows = await Model.knex()('task_row')
          .join('field_row', 'field_row.row_id', 'task_row.row_id')
          .join('row_plan', 'row_plan.row_plan_id', 'field_row.row_plan_id')
          .where({ 'task_row.task_id': req.params.task_id, 'task_row.deleted': false })
          .orderBy('field_row.position')
          .select(
            'row_plan.row_plan_id',
            'row_plan.map_id',
            'field_row.row_id',
            'field_row.row_number',
            'field_row.frag',
            'task_row.status',
            'task_row.completed_at',
            'task_row.note',
          );
        return res.status(200).send(rows);
      } catch (error) {
        return sendError(res, error);
      }
    };
  },

  /**
   * PATCH /row_plan/task/:task_id/rows
   * body: { rows: [{ row_number, frag?, status: 'done' | 'aborted', completed_at?, note? }] }
   * Without frag, the result applies to every fragment of the row. This is what the station reports after a run.
   * A row that already has a result keeps it: repeating the same result is accepted, changing it is a 409.
   * All results are applied in one statement, or none are.
   */
  patchTaskRows() {
    return async (req, res) => {
      const { task_id } = req.params;
      let trx;
      try {
        const updates = req.body?.rows;
        if (!Array.isArray(updates) || !updates.length || updates.length > MAX_ROWS) {
          throw new RowPlanError(`rows must be a list of 1 to ${MAX_ROWS} results`);
        }
        const seen = new Map();
        for (const u of updates) {
          if (!Number.isInteger(u?.row_number) || u.row_number < 0) {
            throw new RowPlanError('row_number must be a non-negative integer');
          }
          if (u.frag !== undefined && (!Number.isInteger(u.frag) || u.frag < 0)) {
            throw new RowPlanError('frag must be a non-negative integer');
          }
          if (!RESULT_STATUSES.includes(u.status)) {
            throw new RowPlanError(`status must be one of ${RESULT_STATUSES.join(', ')}`);
          }
          if (u.completed_at != null && Number.isNaN(Date.parse(u.completed_at))) {
            throw new RowPlanError('completed_at must be a date-time');
          }
          if (u.note != null && (typeof u.note !== 'string' || u.note.length > 1000)) {
            throw new RowPlanError('note must be text of up to 1000 characters');
          }
          const frags = seen.get(u.row_number) ?? new Set();
          const key = u.frag ?? '*';
          if (frags.has(key) || frags.has('*') || (key === '*' && frags.size)) {
            throw new RowPlanError(`row ${u.row_number} appears more than once`);
          }
          frags.add(key);
          seen.set(u.row_number, frags);
        }
        await getWritableTask(req, task_id, { allowComplete: true });

        trx = await transaction.start(Model.knex());
        const current = await trx('task_row')
          .join('field_row', 'field_row.row_id', 'task_row.row_id')
          .where({ 'task_row.task_id': task_id })
          .forUpdate('task_row')
          .select('task_row.row_id', 'task_row.status', 'field_row.row_number', 'field_row.frag');
        const byRow = new Map();
        for (const r of current) byRow.set(r.row_number, [...(byRow.get(r.row_number) ?? []), r]);

        const unmatched = [];
        const changed = [];
        const targets = [];
        for (const u of updates) {
          const matches = (byRow.get(u.row_number) ?? []).filter(
            (r) => u.frag === undefined || r.frag === u.frag,
          );
          if (!matches.length) {
            unmatched.push(u.row_number);
            continue;
          }
          for (const r of matches) {
            if (r.status !== 'pending' && r.status !== u.status) changed.push(u.row_number);
            targets.push({ row_id: r.row_id, u });
          }
        }
        if (unmatched.length) {
          throw new RowPlanError(
            `rows not on this task: ${[...new Set(unmatched)].join(', ')}`,
            404,
          );
        }
        if (changed.length) {
          throw new RowPlanError(
            `rows already have a different result: ${[...new Set(changed)].join(', ')}`,
            409,
          );
        }

        const now = new Date().toISOString();
        await trx.raw(
          `UPDATE task_row SET status = v.status, completed_at = v.completed_at::timestamptz,
             note = v.note, updated_by_user_id = ?, updated_at = ?
           FROM (VALUES ${targets.map(() => '(?::uuid, ?::text, ?::text, ?::text)').join(', ')})
             AS v(row_id, status, completed_at, note)
           WHERE task_row.task_id = ? AND task_row.row_id = v.row_id`,
          [
            req.auth?.user_id,
            now,
            ...targets.flatMap(({ row_id, u }) => [
              row_id,
              u.status,
              new Date(u.completed_at ?? now).toISOString(),
              u.note ?? null,
            ]),
            task_id,
          ],
        );
        await trx.commit();
        return res.sendStatus(204);
      } catch (error) {
        if (trx) await trx.rollback();
        return sendError(res, error);
      }
    };
  },

  /**
   * DELETE /row_plan/:row_plan_id
   * Retracts a plan that no task uses. A plan that it superseded becomes current again.
   */
  deleteRowPlan() {
    return async (req, res) => {
      const { farm_id } = req.headers;
      const context = { user_id: req.auth?.user_id };
      let trx;
      try {
        const plan = await getLivePlan(farm_id, req.params.row_plan_id);
        if (!plan) return res.sendStatus(404);
        trx = await transaction.start(Model.knex());
        const used = await trx('task_row')
          .join('field_row', 'field_row.row_id', 'task_row.row_id')
          .where({ 'field_row.row_plan_id': plan.row_plan_id })
          .first('task_row.task_id');
        if (used) throw new RowPlanError('tasks use rows of this plan', 409);
        await RowPlanModel.query(trx)
          .context(context)
          .patch({ deleted: true })
          .where({ row_plan_id: plan.row_plan_id });
        if (plan.supersedes_row_plan_id) {
          const other = await RowPlanModel.query(trx)
            .whereNotDeleted()
            .where({ supersedes_row_plan_id: plan.supersedes_row_plan_id })
            .first();
          if (!other) {
            await RowPlanModel.query(trx)
              .context(context)
              .patch({ superseded_at: null })
              .where({ row_plan_id: plan.supersedes_row_plan_id });
          }
        }
        await trx.commit();
        return res.sendStatus(204);
      } catch (error) {
        if (trx) await trx.rollback();
        return sendError(res, error);
      }
    };
  },
};

export default rowPlanController;
