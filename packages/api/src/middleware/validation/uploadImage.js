import path from 'path';

async function validateFileExtension(req, res, next) {
  const { file } = req;
  if (!file) return next();

  if (isImage(file)) {
    return next();
  }

  return res.status(400).send(`Do not support file type ${path.extname(file.originalname)}`);
}

function isImage(file) {
  return /^image\/.*/.test(file.mimetype);
}

export default validateFileExtension;
