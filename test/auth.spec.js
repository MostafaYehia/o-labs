process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const userModel = require("../models/user");
const expect = chai.expect;
const should = chai.should();
const config = require("config");
const authTestData = require("./factories/auth");
chai.use(chaiHttp);

const apiUrls = {
  signup: "/auth/signup",
  login: "/auth/login"
};

describe("@Authentication", () => {
  it("@Singup - email should be a valid email address", done => {
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

  it("@Singup - form should have a username field", done => {
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

  it("@Singup - form should have a valid password [min:8, LowerCaseLetters, UpperCaseLetters, SpecialChars, Numbers]", done => {
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

  it("@Singup - Email address should be used once", done => {
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

  // it("@signup - singup with [username/email/password] and receive activation email", done => {
  //   chai
  //     .request(app)
  //     .post(apiUrls.signup)
  //     .send(authTestData.validUser())
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.should.be.json;
  //       res.body.should.have.property("message");
  //       const message = res.body.message;
  //       expect(message).to.equal(
  //         "Account has been created successfully!, check your email and activate your account"
  //       );
  //       done();
  //     });
  // });

  it("@Login - User can login with email and password and recieve a JWT", done => {
    chai
      .request(app)
      .post(apiUrls.login)
      .send(authTestData.validUser())
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.contains.property("token");
        const tokenChunks = res.body.token.split(".").length;
        expect(tokenChunks).to.equal(3);
        done();
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

  it("@Login - Unauthenticate without a correct email", done => {
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
