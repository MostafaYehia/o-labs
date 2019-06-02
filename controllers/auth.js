const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const userController = require("../controllers/user");
const emailController = require("../controllers/email");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exist = await userController.findUser(email);

    if (exist)
      return res
        .status(409)
        .json({ error: "This email has been already used" });

    const newUser = new userModel({ username, email, password });
    await newUser.save();

    const token = newUser.generateToken();
    const mailInfo = await emailController.sendVerificationEmail(
      token,
      newUser
    );
    res.status(200).json({
      message:
        "Account has been created successfully!, check your email and activate your account"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userController.findUser(email);

    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const validPassoword = await user.checkPassword(password);

    if (!validPassoword)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = user.generateToken();
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAuth = (req, res) => {
  const token =
    req.query.token || req.body.token || req.get("Authorization").split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unuthorized" });
  jwt.verify(token, "blackswan", (err, payload) => {
    if (err) return res.status(401).json({ error: "Unuthorized" });

    req.userId = payload.id;
    return res.status(200).json({ message: "Authenticated!" });
  });
};

exports.sendVerification = async (req, res) => {
  try {
    const token = req.body.token;
    const payload = await this.verifyToken(token);
    const user = await userController.findUserById(payload.id);
    emailController.sendVerificationEmail(token, user);
    res.status(200).json({
      message: "An email with ativation link has been sent successfully"
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const payload = await this.verifyToken(token);
    await userController.verifyAccount(payload.id);
    res
      .status(200)
      .json({ message: "Your account has been activated successfully!" });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.isAuthenticated = (req, res, next) => {
  const brearer = req.get("Authorization");
  const token = req.query.token || req.body.token || brearer ? brearer.split(" ")[1]: null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, "blackswan", (err, payload) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });

    req.userId = payload.id;
    next()
  });
};

exports.verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "blackswan", (err, payload) => {
      if (err) return reject(err);

      resolve(payload);
    });
  });
};
