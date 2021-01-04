const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../tickets'))
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.');
    cb(null, `${file.originalname.replace(/\./g, '')}-${Date.now()}-ticket.${ext[ext.length - 1]}`)
  },
})

function multerDiskUpload(req, res, next) {
  const upload = multer({ storage }).single('_file_');
  upload(req, res, (error) => {
    if(error) {
      res.status(400).send({ message: 'attachment could not be uploaded' })
    }
    next();
  })
}

module.exports = multerDiskUpload