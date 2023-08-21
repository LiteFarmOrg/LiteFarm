import path from 'path';

async function validateFileExtension(req, res, next) {
  const { file } = req;
  if (isMinimizedImage(file)) {
    req.isMinimized = true;
    return next();
  } else if (isAllowedDocument(file)) {
    req.isTextDocument = true;
    return next();
  } else if (isImageOrPdf(file)) {
    req.isNotMinimized = true;
    return next();
  }

  return res.status(400).send(`Do not support file type ${path.extname(file.originalname)}`);
}

const allowedDocumentFormatSet = new Set([
  '.csv',
  '.doc',
  '.docb',
  '.docm',
  '.docx',
  '.dot',
  '.dotm',
  '.dotx',
  '.txt',
  '.xls',
  '.xlsx',
]);

const minimizedImageFormatSet = new Set(['.webp', '.svg']);

function isMinimizedImage(file) {
  return minimizedImageFormatSet.has(path.extname(file.originalname));
}

function isAllowedDocument(file) {
  return allowedDocumentFormatSet.has(path.extname(file.originalname));
}

function isImageOrPdf(file) {
  return file.mimetype === 'application/pdf' || /^image\/.*/.test(file.mimetype);
}

export default validateFileExtension;
