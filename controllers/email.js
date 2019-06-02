"use strict";

const nodemailer = require("nodemailer");

exports.sendVerificationEmail = (token, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "nodeapi.test.email@gmail.com",
          pass: "testemailpassword"
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"o-labs" <mostafayehia@o-labs.com>', // sender address
        to: user.email, // list of receivers
        subject: `Account Activation`, // Subject line
        html: `
        <h1>Hello, ${user.username}</h1>
        <p>Welcome to o-labs, to activate your account click on this link below</p>
        <br>
        <a style="" href="http://localhost:3000/auth/verify?token=${token}">Activate My Account</a>
        <br><br>
        <h3>Thank you<h3>
        <br>
        <small style="color:lightgrey">o-labs</small>
    `
      });

      resolve(info);
    } catch (error) {
      reject(error);
    }
  });
};
