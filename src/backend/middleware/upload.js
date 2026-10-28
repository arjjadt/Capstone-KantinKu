const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = (folder) => multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', folder));
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const uploadAvatar = multer({ storage: storage('avatars'), fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadMenu = multer({ storage: storage('menus'), fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadUmkm = multer({ storage: storage('umkm'), fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = {
  uploadAvatar,
  uploadMenu,
  uploadUmkm
};
