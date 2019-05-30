const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    const validPassoword = user.checPassword(password);

    if (!validPassoword)
      return res.status(401).json({ error: "Invalid password" });

    const token = user.generateToken();
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, email, passowrd } = req.body;

    const newUser = await userModel.create({ username, email, passowrd });

    console.log("User has been created", newUser);
    res.status(200).json({ status: "Account has been created successfully!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.checkAuth = (req, res) => {
  const token = req.params.token || req.body.token;
  const valid = verifyToken(token);
  res.status(200).json({ status: `Autheticated ${valid}` });
};


exports.sendEmail = (message) => {
  res.status(200).json({ verified: false });
};

exports.verifyEmail = (req, res) => {
  res.status(200).json({ verified: false });
};

exports.generateToken = (req, res) => {
  console.log("This is the new token");
};

exports.verifyToken = verifyToken;

function verifyToken() {
  return true;
}
