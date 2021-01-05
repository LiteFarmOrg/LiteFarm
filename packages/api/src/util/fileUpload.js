const multer = require('multer');


const storage = multer.memoryStorage();

function multerDiskUpload(req, res, next) {
  const upload = multer({ storage }).single('_file_');
  upload(req, res, (error) => {
    if(error) {
      return res.status(400).send({ message: 'attachment could not be uploaded' })
    }
    next();
  })
}

module.exports = multerDiskUpload
