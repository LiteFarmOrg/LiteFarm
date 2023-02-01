import path from 'path';
import escapeHtml from 'escape-html';

async function validateFileExtension(req, res, next) {
  const { file } = req;
  if (isImage(file)) {
    return next();
  }

  return res
    .status(400)
    .send('Do not support file type ' + escapeHtml(path.extname(file.originalname)));
}

function isImage(file) {
  return /^image\/.*/.test(file.mimetype);
}

export default validateFileExtension;
