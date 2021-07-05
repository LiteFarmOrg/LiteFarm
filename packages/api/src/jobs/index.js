const Queue = require('bull');
require('dotenv').config();
const zipQueue = new Queue('zip', 'redis://localhost:1500');
const excelQueue = new Queue('excel', 'redis://localhost:1500');
const pdfQueue = new Queue('pdf', 'redis://localhost:1500');
const emailQueue = new Queue('email', 'redis://localhost:1500');
const zipFn = require('./certification/DoZip');
const excelFn = require('./certification/recordD');
const pdfFn = require('./certification/pdf');
const emailFn = require('./certification/email');

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

zipQueue.add({ farm_id: '2057ced0-ca09-11eb-acd2-0242ac120002', files: [
  '0050e352-7505-4930-bf47-37f6966cff9f.jpg',
  '558374d4-1cf1-4a4b-8945-9f29f620b718.jpg',
] }, { removeOnComplete: true, delay: 3000 })

module.exports = {
  zipQueue, emailQueue, excelQueue, pdfQueue,
}