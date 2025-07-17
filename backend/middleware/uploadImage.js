const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profileImages");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `user_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, PNG allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
