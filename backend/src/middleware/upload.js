const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");
["profiles", "documents"].forEach((dir) => {
  fs.mkdirSync(path.join(uploadRoot, dir), { recursive: true });
});

const profileStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(uploadRoot, "profiles")),
  filename: (req, file, cb) => cb(null, `${req.user.role}_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`),
});

const documentStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(uploadRoot, "documents")),
  filename: (req, file, cb) => cb(null, `driver_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`),
});

const uploadPhoto = multer({ storage: profileStorage }).single("profile_photo");
const uploadDocument = multer({ storage: documentStorage }).single("document");

module.exports = { uploadPhoto, uploadDocument };
