const Queue = require('bull');
// const path = require('path');
const zipQueue = new Queue('zip', 'redis://localhost:1500');
const excelQueue = new Queue('excel', 'redis://localhost:1500');
const pdfQueue = new Queue('pdf', 'redis://localhost:1500');
const emailQueue = new Queue('email', 'redis://localhost:1500');
const zipFn = require('./DoZip');
const excelFn = require('./recordD');
const pdfFn = require('./pdf');
const emailFn = require('./email');
zipQueue.process(zipFn(excelQueue));
excelQueue.process(excelFn(pdfQueue));
pdfQueue.process(pdfFn(emailQueue));
emailQueue.process(emailFn);

emailQueue.on('completed', () => {
  console.log('EMAIL SENT');
})


zipQueue.on('error', (e) => console.error(e));
excelQueue.on('error', (e) => console.error(e));
pdfQueue.on('error', (e) => console.error(e));
emailQueue.on('error', (e) => console.error(e));

zipQueue.add({ test: 2223 }, { removeOnComplete: true, delay: 3000 })

module.exports = {
  zipQueue, emailQueue, excelQueue, pdfQueue,
}