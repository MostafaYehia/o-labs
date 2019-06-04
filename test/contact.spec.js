const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const contactModel = require("../models/contact");
const expect = chai.expect;
const should = chai.should();
const authTestData = require("./factories/auth");
const contactsTestData = require("./factories/contacts");
const path = require("path");

let avatarPath = path.join(__dirname, "images/avatar-test.png");
let largeAvatarPath = path.join(__dirname, "images/large-avatar-test.jpg");
let invalidAvatarTypePath = path.join(__dirname, "images/avatar.txt");
let uplaodedAvatarExtension = "";
let uploadedAvatarBasePath = path.join(__dirname, "../uploads/imgs/avatars");

chai.use(chaiHttp);

const userCredentials = {
  email: authTestData.validUser().email,
  password: authTestData.validUser().password
};

let token = "";
let createdContactId = "";

describe("@Contacts", () => {
  before(done => {
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
      .get("/api/contacts?page=3")
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contacts");
        res.body.contacts.should.be.a("array");

        done();
      });
  });

  it("should get paginated list of contacts on /contacts?page=2 GET and respond with 10 'contacts' array", done => {
    chai
      .request(app)
      .get("/api/contacts?page=2")
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contacts");
        res.body.contacts.should.be.a("array");
        const contacts = res.body.contacts;
        expect(contacts).to.have.length(0, 10);
        done();
      });
  });

  it("should get alphabetically sorted list of contacts on /contacts?page=1&sortBy=firstName GET", done => {
    chai
      .request(app)
      .get("/api/contacts?page=2&sortBy=firstName")
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contacts");
        res.body.contacts.should.be.a("array");
        const firstContact = res.body.contacts[0].firstName;

        console.log("firstContact", firstContact)
        const firstChar = firstContact
          .split(" ")[0]
          .split("")[0]
          .toLowerCase();
        expect(firstChar).to.equal("a");
        done();
      });
  });

  it("should add a SINGLE contact on /contacts POST", done => {
    chai
      .request(app)
      .post("/api/contacts")
      .set("Authorization", token)
      .send(contactsTestData.newValidContact())
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
    chai
      .request(app)
      .put(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .send(contactsTestData.updateValidContact())
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contact");
        const updatedEmail = res.body.contact.email;
        expect(updatedEmail).to.equal("updated@gmail.com");
        done();
      });
  });

  it("Contact avatar max file size is 5Mb", done => {
    chai
      .request(app)
      .put(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .attach("avatar", fs.readFileSync(largeAvatarPath), "avatar-test.png")
      .end((err, res) => {
        res.should.have.status(415);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.equal("Maximum size is 5Mb");
        done();
      });
  });

  it("Contact avatar should be JPG,PNG", done => {
    chai
      .request(app)
      .put(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .attach("avatar", fs.readFileSync(invalidAvatarTypePath), "avatar.txt")
      .end((err, res) => {
        res.should.have.status(415);
        res.should.be.json;
        res.body.should.have.property("message");
        const message = res.body.message;
        expect(message).to.equal(
          "Invalid file type only, JPG and PNG are supported)"
        );
        done();
      });
  });

  it("should upload contact avatar with 3 sizes [normal, medium, small] and save it in 'uploads'", done => {
    chai
      .request(app)
      .put(`/api/contacts/${createdContactId}`)
      .set("Authorization", token)
      .attach("avatar", fs.readFileSync(avatarPath), "avatar-test.png")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contact");
        res.body.contact.should.have.property("avatars");
        const avatars = res.body.contact.avatars;
        const originalUpdated =
          avatars.original !=
          "uploads/imgs/avatars/1559520000-o-labs-avatar.png";
        const mediumUpdated =
          avatars.medium !=
          "uploads/imgs/avatars/1559520000-o-labs-avatar-medium.png";
        const smallUpdated =
          avatars.small !=
          "uploads/imgs/avatars/1559520000-o-labs-avatar-small.png";

        uplaodedAvatarExtension = avatars.original.split(".")[1];

        expect(originalUpdated && mediumUpdated && smallUpdated).to.equal(true);

        done();
      });
  });

  it("Uploaded avatar should be save in 'uploads/imgs/avatars' directory", done => {
    fs.access(
      `${uploadedAvatarBasePath}/${createdContactId}.${uplaodedAvatarExtension}`,
      fs.F_OK,
      err => {
        if (err) {
          console.error(err);
          return;
        }

        done();
      }
    );
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

  it("Delete avatar after deleting contact", done => {
    fs.access(
      `${uploadedAvatarBasePath}/\/${createdContactId}.${uplaodedAvatarExtension}`,
      fs.F_OK,
      err => {
        if (err) {
          return done();
        }

        throw new Error("File is not deleted");
      }
    );
  });
});
