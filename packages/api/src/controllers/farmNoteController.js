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

import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import FarmNoteModel from '../models/farmNoteModel.js';
import {
  s3,
  getPublicS3BucketName,
  getPublicS3Url,
  imaginaryPost,
} from '../util/digitalOceanSpaces.js';

const farmNoteController = {
  getFarmNotes() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth;

        const notes = await FarmNoteModel.query()
          .whereNotDeleted()
          .where('farm_id', farm_id)
          .where(function () {
            this.where('is_private', false).orWhere('user_id', user_id);
          })
          .orderBy('created_at', 'desc');

        return res.status(200).json(notes);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  createFarmNote() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth;
        const data = JSON.parse(req.body.data);

        let image_url;
        if (req.file) {
          const TYPE = 'webp';
          const fileName = `farm_note/${farm_id}/${uuidv4()}.${TYPE}`;
          const compressedImage = await imaginaryPost(
            req.file,
            { width: '1024', type: TYPE },
            { endpoint: 'resize' },
          );
          await s3.send(
            new PutObjectCommand({
              Body: compressedImage.data,
              Bucket: getPublicS3BucketName(),
              Key: fileName,
              ACL: 'public-read',
            }),
          );
          image_url = `${getPublicS3Url()}/${fileName}`;
        }

        const note = await FarmNoteModel.query()
          .context({ user_id })
          .insert({ farm_id, user_id, ...data, ...(image_url ? { image_url } : {}) })
          .returning('*');

        return res.status(201).json(note);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  editFarmNote() {
    return async (req, res) => {
      try {
        const { farm_note_id } = req.params;
        const { user_id } = req.auth;

        const { note, is_private } = req.body;
        const updated = await FarmNoteModel.query()
          .context({ user_id })
          .patchAndFetchById(farm_note_id, { note, is_private });

        return res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  deleteFarmNote() {
    return async (req, res) => {
      try {
        const { farm_note_id } = req.params;
        const { user_id } = req.auth;

        await FarmNoteModel.query().context({ user_id }).deleteById(farm_note_id);

        return res.status(200).json({ message: 'Note deleted' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default farmNoteController;
