exports.login = (req, res) => {
  res.status(200).json({ status: "logged in" });
};

exports.signup = (req, res) => {
  res.status(200).json({ status: "Account has been created successfully!" });
};

exports.checkAuth = (req, res) => {
  const token = req.params.token || req.body.token;
  const valid = verifyToken(token);
  res.status(200).json({ status: `Autheticated ${valid}` });
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
