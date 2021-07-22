const Queue = require('bull');
require('dotenv').config();
const redisConf = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
}
const retrieveQueue = new Queue('retrieve', redisConf);
const excelQueue = new Queue('excel', redisConf);
const zipQueue = new Queue('zip', redisConf);
const pdfQueue = new Queue('pdf', redisConf);
const emailQueue = new Queue('email', redisConf);
const uploadQueue = new Queue('upload', redisConf);
const retrieveFn = require('./certification/do_retrieve');
const uploadFn = require('./certification/upload');
const excelFn = require('./certification/recordD');
const zipFn = require('./certification/zip');
const pdfFn = require('./certification/pdf');
const emailFn = require('./certification/email');

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


module.exports = {
  zipQueue, emailQueue, excelQueue, pdfQueue,
}