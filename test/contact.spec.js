require('./auth.spec')

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const contactModel = require("../models/contact");
const expect = chai.expect;
const should = chai.should();
const authTestData = require("./factories/auth");
chai.use(chaiHttp);

const userCredentials = {
  email: authTestData.validUser().email,
  password: authTestData.validUser().password
};

let token = "";
let createdContactId = "";

describe("@Contacts", () => {
  // Drop contacts collection in the test database before testing
  before(function(done) {
    /**
     * Authenticate user before calling the database;
     */
    chai
      .request(app)
      .post("/auth/login")
      .send(userCredentials)
      .end(function(err, res) {
        res.should.have.status(200);
        token = `bearer ${res.body.token}`;
        done();
      });
  });

  it("should list ALL contacts on /contacts GET and respond with 'contacts' array", done => {
    chai
      .request(app)
      .get("/api/contacts")
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contacts");
        res.body.contacts.should.be.a("array");

        done();
      });
  });

  it("should add a SINGLE contact on /contacts POST", done => {
    const newContact = {
      firstName: "Ahmed",
      lastName: "Emad",
      phone: "+201200127070",
      email: "ahmed.emad@gmail.com"
    };
    chai
      .request(app)
      .post("/api/contacts")
      .set("Authorization", token)
      .send(newContact)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contact");
        res.body.contact.should.have.property("_id");
        createdContactId = res.body.contact._id;
        res.body.contact.should.have.property("avatars");
        res.body.contact.should.have.property("firstName");
        res.body.contact.should.have.property("lastName");
        res.body.contact.should.have.property("phone");
        res.body.contact.should.have.property("email");

        done();
      });
  });

  it("should list a SINGLE contact on /contact/<id> GET with [avatars/firstName/lastName/phone/email]", done => {
    chai
      .request(app)
      .get(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contact");
        res.body.contact.should.have.property("_id");
        res.body.contact.should.have.property("avatars");
        res.body.contact.should.have.property("firstName");
        res.body.contact.should.have.property("lastName");
        res.body.contact.should.have.property("phone");
        res.body.contact.should.have.property("email");
        done();
      });
  });

  it("should update a SINGLE contact on /contact/<id> PUT, update email", done => {
    const newContact = {
      firstName: "Khaled",
      lastName: "Emad",
      phone: "+201200127060",
      email: "updated@gmail.com"
    };
    chai
      .request(app)
      .put(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .send(newContact)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contact");
        const updatedEmail = res.body.contact.email;
        expect(updatedEmail).to.equal("updated@gmail.com");
        done();
      });
  });
  it("should delete a SINGLE contact on /contact/<id> DELETE", done => {
    chai
      .request(app)
      .delete(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.equal("Contact has been deleted successfully!");
        done();
      });
  });

  afterEach(function(done) {
    done();
  });
});
