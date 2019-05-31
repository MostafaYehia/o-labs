const userModel = require("../models/user");

exports.findUser = async email => {
  return userModel.findOne({ email });
};

exports.findUserById = id => userModel.findById({ _id: id });

exports.verifyAccount = id => {
  return new Promise(async (resolve, reject) => {
    try {
      await userModel.findOneAndUpdate({_id: id}, { isVerified: true });
      resolve(true);
    } catch (error) {
      reject(false);
    }
  });
}

