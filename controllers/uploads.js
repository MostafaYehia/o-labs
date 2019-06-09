const multer = require("multer");

exports.configFileStorage = (fieldName, folderPath, fileTypes) => {
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, folderPath);
    },
    filename: function(req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      const { id } = req.params;

      console.log("With this name: ", `${id}.${ext}` )
      cb(null, `${id}.${ext}`);
    }
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      if (!fileTypes.includes(ext))
        return cb("Invalid file type only, JPG and PNG are supported)", false);
      cb(null, true);
    }
  }).single(fieldName);
};

exports.errorHandler = uploader => {
  return (req, res, next) => {
    uploader(req, res, err => {
      let message = err ? err.message || err : null;

      if (message == "File too large") message = "Maximum size is 5Mb";

      if (message) {
        return res.status(415).json({ message });
      }
      next();
    });
  };
};
