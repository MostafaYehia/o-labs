const btoa = require("btoa");
const sharp = require("sharp");

exports.resize = (id, path, size, type) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await sharp(path)
        .resize(size)
        .toBuffer();

      let base64 = btoa(String.fromCharCode.apply(null, buffer));
      base64 = `data:image/jpg;base64,${base64}`;
      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
};
