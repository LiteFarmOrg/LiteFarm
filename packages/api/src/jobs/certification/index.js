/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import Queue from 'bull';

const processExports = (queueConfig) => {
  const retrieveQueue = new Queue('retrieve', queueConfig);
  const excelQueue = new Queue('excel', queueConfig);
  const zipQueue = new Queue('zip', queueConfig);
  const pdfQueue = new Queue('pdf', queueConfig);
  const emailQueue = new Queue('email', queueConfig);
  const uploadQueue = new Queue('upload', queueConfig);
  const retrieveFn = require('./do_retrieve');
  const uploadFn = require('./upload');
  const excelFn = require('./recordD');
  const zipFn = require('./zip');
  const pdfFn = require('./pdf');
  const emailFn = require('./email');

  retrieveQueue.process(retrieveFn(excelQueue, emailQueue));
  excelQueue.process(excelFn(pdfQueue, zipQueue, emailQueue));
  pdfQueue.process(pdfFn(zipQueue, emailQueue));
  zipQueue.process(zipFn(uploadQueue, emailQueue));
  uploadQueue.process(uploadFn(emailQueue));
  emailQueue.process(emailFn);

  retrieveQueue.on('error', (e) => console.error(e));
  excelQueue.on('error', (e) => console.error(e));
  pdfQueue.on('error', (e) => console.error(e));
  emailQueue.on('error', (e) => console.error(e));
  uploadQueue.on('error', (e) => console.error(e));
  zipQueue.on('error', (e) => console.error(e));
};

export default processExports;
