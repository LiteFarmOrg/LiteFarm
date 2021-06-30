const Queue = require('bull');
const path = require('path');
const zipQueue = new Queue('zip', 'redis://localhost:6379');
const excelQueue = new Queue('excel', 'redis://localhost:6379');
const pdfQueue = new Queue('pdf', 'redis://localhost:6379');
const emailQueue = new Queue('email', 'redis://localhost:6379');

zipQueue.process(path.join(__dirname, 'DoZip.js'));
excelQueue.process(path.join(__dirname, 'recordD.js'));
pdfQueue.process(path.join(__dirname, 'pdf.js'));
emailQueue.process(path.join(__dirname, 'email.js'));

emailQueue.on('completed', () => {
  console.log('EMAIL SENT');
})


zipQueue.on('error', (e) => console.error(e));
excelQueue.on('error', (e) => console.error(e));
pdfQueue.on('error', (e) => console.error(e));
emailQueue.on('error', (e) => console.error(e));

const startCertification = async () => {
  const job = await zipQueue.add({ test: 2223 }, { removeOnComplete: true, delay: 3000 });
  await job.remove();
}

startCertification()


module.exports = {
  zipQueue, emailQueue, excelQueue, pdfQueue,
}