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

/**
 * Handles objection.js errors and sends appropriate responses based on the error type.
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
 *   await handleObjectionError(error, res, trx);
 * }
 */

export async function handleObjectionError(err, res, trx) {
  switch (err.name) {
    case 'ValidationError': {
      await trx.rollback();
      const errorString = Object.keys(err.data).reduce((acc, cv, ci) => {
        const comma = Object.keys(err.data).length - 1 == ci ? '' : ', ';
        return acc.concat(`${cv} ${err.data[cv][0].message}${comma}`);
      }, '');
      return res.status(err.statusCode).send(`Validation error: ${errorString}`);
    }
    case 'CheckViolationError': {
      await trx.rollback();
      return res.status(400).send(`Constraint check error: ${err.constraint}`);
    }
    case 'ForeignKeyViolationError': {
      await trx.rollback();
      return res.status(400).send(`Foreign key violation: ${err.nativeError.detail}`);
    }
    default: {
      console.error(err);
      await trx.rollback();
      return res.status(500).json({
        err,
      });
    }
  }
}
