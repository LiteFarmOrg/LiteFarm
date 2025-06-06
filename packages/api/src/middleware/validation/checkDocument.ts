/*
 *  Copyright (c) 2025 LiteFarm.org
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

import { NextFunction, Request, Response } from 'express';
import { customError, LiteFarmCustomError } from '../../util/customErrors.js';
import { DocumentWithFiles } from '../../models/types.js';

export function validateFilesLength(document: DocumentWithFiles) {
  if (!Array.isArray(document.files) || document.files?.length <= 0) {
    throw customError('Can not create document without file links');
  }
}

export function checkCreateDocument() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const document = req.body;
      if (!document) {
        throw customError('Document not found');
      }
      validateFilesLength(document);
      next();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof LiteFarmCustomError) {
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      }
      return res.status(500).json({
        error,
      });
    }
  };
}

export function checkUpdateDocument() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const document = req.body;
      if (!document) {
        throw customError('Document not found');
      }
      validateFilesLength(document);
      next();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof LiteFarmCustomError) {
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      }
      return res.status(500).json({
        error,
      });
    }
  };
}
