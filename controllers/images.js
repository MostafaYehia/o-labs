const sharp = require("sharp");

exports.resize = (path, type, size) => {
  let originalPath = path;
  path = path.split(".");
  let fileName = path[0];
  let ext = path[1];
  let targetPath = `${fileName}-${type}.${ext}`;

  return new Promise(async (resolve, reject) => {
    try {
      await sharp(originalPath)
        .resize(size)
        .toFile(targetPath);

      resolve(targetPath);
    } catch (error) {
      reject(error);
    }
  });
};
