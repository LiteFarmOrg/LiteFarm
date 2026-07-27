import multer from 'multer';

const storage = multer.memoryStorage();

function multerDiskUpload(req, res, next) {
  const upload = multer({
    storage,
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB
      files: 1,
      fields: 10,
      fieldNestingDepth: 2,
    },
  }).single('_file_');
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).send({ message: 'attachment could not be uploaded' });
    }
    next();
  });
}

export default multerDiskUpload;
