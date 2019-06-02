const multer = require("multer");

exports.configFileStorage = (fieldName, folderPath, fileTypes) => {
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, folderPath);
    },
    filename: function(req, file, cb) {
      console.log("File is: ", file);
      const ext = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}.${ext}`);
    }
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      if (!fileTypes.includes(ext)) cb("Invalid file type", false);
      else cb(null, true);
    }
  }).single(fieldName);
};

exports.errorHandler = uploader => {
  return (req, res, next) => {
    uploader(req, res, err => {
      console.log(err);
      if (err) {
        return res.status(415).json({ message: err });
      }
      next();
    });
  };
};
