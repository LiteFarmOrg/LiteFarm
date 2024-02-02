/*
 *  Copyright (C) 2024 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (baseController.js) is part of LiteFarm.
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

// See https://github.com/Vincit/objection.js/issues/2023#issuecomment-806059039
import objection from 'objection';

/**
 * Handles objection.js errors and sends appropriate responses based on the error type.
 * Augmented from: https://vincit.github.io/objection.js/recipes/error-handling.html#examples
 *
 * @param {Error} err - The objection.js error object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('objection').Transaction} trx - The objection.js transaction object.
 * @returns {Promise<void>} A promise that resolves after handling the error and sending the response.
 *
 * @example
 * try {
 *   // Some objection.js operation that may throw an error
 * } catch (error) {
 *   await handleObjectionError(error, res);
 * }
 */
export async function handleObjectionError(err, res, trx) {
  if (err instanceof objection.ValidationError) {
    switch (err.type) {
      case 'ModelValidation':
        await trx.rollback();
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: err.data,
        });
        break;
      case 'RelationExpression':
        await trx.rollback();
        res.status(400).send({
          message: err.message,
          type: 'RelationExpression',
          data: {},
        });
        break;
      case 'UnallowedRelation':
        await trx.rollback();
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: {},
        });
        break;
      case 'InvalidGraph':
        await trx.rollback();
        res.status(400).send({
          message: err.message,
          type: err.type,
          data: {},
        });
        break;
      default:
        await trx.rollback();
        res.status(400).send({
          message: err.message,
          type: 'UnknownValidationError',
          data: {},
        });
        break;
    }
  } else if (err instanceof objection.NotFoundError) {
    await trx.rollback();
    res.status(404).send({
      message: err.message,
      type: 'NotFound',
      data: {},
    });
  } else if (err instanceof objection.UniqueViolationError) {
    await trx.rollback();
    res.status(409).send({
      message: err.message,
      type: 'UniqueViolation',
      data: {
        columns: err.columns,
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof objection.NotNullViolationError) {
    await trx.rollback();
    res.status(400).send({
      message: err.message,
      type: 'NotNullViolation',
      data: {
        column: err.column,
        table: err.table,
      },
    });
  } else if (err instanceof objection.ForeignKeyViolationError) {
    await trx.rollback();
    res.status(409).send({
      message: err.message,
      type: 'ForeignKeyViolation',
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof objection.CheckViolationError) {
    await trx.rollback();
    res.status(400).send({
      message: err.message,
      type: 'CheckViolation',
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof objection.ConstraintViolationError) {
    await trx.rollback();
    res.status(400).send({
      message: err.message,
      type: 'ConstraintViolation',
      data: {},
    });
  } else if (err instanceof objection.DataError) {
    await trx.rollback();
    res.status(400).send({
      message: err.message,
      type: 'InvalidData',
      data: {},
    });
  } else if (err instanceof objection.DBError) {
    await trx.rollback();
    res.status(500).send({
      message: err.message,
      type: 'UnknownDatabaseError',
      data: {},
    });
  } else {
    await trx.rollback();
    res.status(500).send({
      message: err.message,
      type: 'UnknownError',
      data: {},
    });
  }
}
