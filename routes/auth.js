var express = require("express");
var router = express.Router();

// Contacts
const authController = require('../controllers/auth');

/* GET contacts listing. */
router
.post("/login", authController.login)
.post("/signup", authController.signup)
.get("/check", authController.checkAuth)
.get("/verify", authController.verifyEmail)

module.exports = router;
