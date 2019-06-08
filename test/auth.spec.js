process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const userModel = require("../models/user");
const authController = require("../controllers/auth");
const expect = chai.expect;
const should = chai.should();
const config = require("config");
const authTestData = require("./factories/auth");
chai.use(chaiHttp);

const apiUrls = {
  signup: "/auth/signup",
  verify: "/auth/verify",
  login: "/auth/login"
};
let token = "";

describe("@Authentication", () => {
  it("@signup - email should be a valid email address", done => {
    chai
      .request(app)
      .post(apiUrls.signup)
      .send(authTestData.invalidUserEmail())
      .end((err, res) => {
        res.res.should.have.status(500);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.contain("is not a valid email!");
        done();
      });
  });

  it("@signup - form should have a username field", done => {
    chai
      .request(app)
      .post(apiUrls.signup)
      .send(authTestData.invalidUserUsername())
      .end((err, res) => {
        res.should.have.status(500);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.contain("you should enter a username");
        done();
      });
  });

  it("@signup - form should have a valid password [min:8, LowerCaseLetters, UpperCaseLetters, SpecialChars, Numbers]", done => {
    chai
      .request(app)
      .post(apiUrls.signup)
      .send(authTestData.invalidUserPassword())
      .end((err, res) => {
        res.should.have.status(422);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.contain(
          "password should be a mix of (Uppercase,Lowercase,Number and special characters)"
        );
        done();
      });
  });

  it("@signup - signup with [username/email/password] and receive activation email", done => {
    chai
      .request(app)
      .post(apiUrls.signup)
      .send(authTestData.validUser())
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.equal(
          "Account has been created successfully!, check your email and activate your account"
        );
        done();
      });
  });

  it("@signup - Email address should be used once", done => {
    chai
      .request(app)
      .post(apiUrls.signup)
      .send(authTestData.validUser())
      .end((err, res) => {
        res.should.have.status(409);
        res.should.be.json;
        res.body.should.contains.property("message");
        const message = res.body.message;
        expect(message).to.equal("This email has been already used");
        done();
      });
  });

  it("@Login - User can login with email and password and recieve a JWT", done => {
    chai
      .request(app)
      .post(apiUrls.login)
      .send(authTestData.validUser())
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.contains.property("token");
        token = res.body.token;
        // Token has been sent as JWT
        const tokenChunks = token.split(".").length;
        expect(tokenChunks).to.equal(3);

        authController.verifyToken(token).then(async payload => {
          const user = await userModel.findById(payload.id);
          // isVerified falg has been initialized with false
          expect(user.isVerified).to.equal(false);
          done();
        });
      });
  });

  it("@signup - Verify account over email's sent token", done => {
    chai
      .request(app)
      .get(`${apiUrls.verify}?token=${token}`)
      .end((err, res) => {
        res.should.have.status(301);
        authController.verifyToken(token).then(async payload => {
          const user = await userModel.findById(payload.id);
          // isVerified falg has been changed
          expect(user.isVerified).to.equal(true);
          expect(message).to.equal(
            "Your account has been activated successfully!"
          );

          done();
        });
      });
  });

  it("@Login - Unauthenticate without a correct password", done => {
    chai
      .request(app)
      .post(apiUrls.login)
      .send(authTestData.invalidUserPassword())
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.json;
        res.body.should.contains.property("message");
        const message = res.body.message;
        expect(message).to.equal("Invalid email or password");
        done();
      });
  });

  it("@Login - Unauthorize user without a correct email", done => {
    chai
      .request(app)
      .post(apiUrls.login)
      .send(authTestData.invalidUserUsername())
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.json;
        res.body.should.contains.property("message");
        const message = res.body.message;
        expect(message).to.equal("Invalid email or password");
        done();
      });
  });
});
