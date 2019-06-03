const btoa = require('btoa');
const sharp = require("sharp");

exports.resize = (id, path, size, type) => {
  let originalPath = path.split(".");
  let ext = originalPath[1];
  let newSizePath = `${originalPath[0]}-${type}.${ext}`;

  console.log("Orininal path: ", originalPath);
  console.log("newSizePath path: ", newSizePath);

  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await sharp(path)
        .resize(size)
        .toBuffer();

      let base64 = btoa(String.fromCharCode.apply(null, buffer));
      console.log("encoded");
      base64 = `data:image/jpg;base64,${base64}`;
      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
};
