const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const userModel = require("../models/user");
const contactModel = require("../models/contact");
const expect = chai.expect;
const should = chai.should();
const authTestData = require("./factories/auth");
const contactsTestData = require("./factories/contacts");
const path = require("path");

let avatarPath = path.join(__dirname, "images/avatar-test.png");
let largeAvatarPath = path.join(__dirname, "images/large-avatar-test.jpg");
let invalidAvatarTypePath = path.join(__dirname, "images/avatar.txt");
let uploadedAvatarPath = "";

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
      });

    /**
     * Generete some data
     */

    userModel.find({}).then(users => {
      const randomUserId = users[0]._id;
      const dummyContacts = contactsTestData.generateDummyContacts(
        randomUserId
      );
      contactModel.insertMany(dummyContacts).then(() => {
        done();
      });
    });
  });

  it("List ALL contacts on /contacts GET and respond with 'contacts' array", done => {
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

  it("Get paginated list of contacts on /contacts?page=2 GET and respond with 10 'contacts' array", done => {
    chai
      .request(app)
      .get("/api/contacts?page=1")
      .set("Authorization", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property("contacts");
        res.body.contacts.should.be.a("array");
        const contacts = res.body.contacts;
        expect(contacts).to.have.length(10);
        done();
      });
  });

  it("Create a SINGLE contact on /contacts POST", done => {
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

        createdContactId = res.body.contact._id;

        uploadedAvatarPath = avatars["original"];
        const originalUpdated =
          uploadedAvatarPath !=
          "uploads/imgs/avatars/1559520000-o-labs-avatar.png";
        const mediumUpdated =
          avatars.medium !=
          "data:image/jpg;base64,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";
        const smallUpdated =
          avatars.small !=
          "data:image/jpg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABGADIDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAIEBQYHAQP/xAA0EAABAwIFAQUHAgcAAAAAAAABAAIDBBEFBhIhMUETMlFhcQcUIiORobEzQlJzgYKS0fD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AiEIQUAuXTPE6+OgpzLIHOO9mjqoJuc6APLZmSR22vs5Bal1NqSpiqoWzU7w+NwuHDqnCBwHbBC8g7ZCBCS8gAk8DddukkoKXUsnzZjrqGnqDDTw3u08v3/7ZeGZ8kPwiR4ZOzui92c+Pqrbl3L1NHi0uiqkp5pw9zZQ/flptx5ndN87UeJ0VLh8b8RdOHOcHOedTiBa253te+3kgq3s8r5YqqXDpHNe0gvb00kchaACqNlTAHR45UYpO49mHEQi1g4nYn0V3BQLQlAbBCBtUTCGCSV99LGlx/oFnOKZxxTVJ2JjhaDsGsubepV+r29pQ1LP4onD7FY3iBJdzYHr4ef1sgvWRa6rx3E3iaud2jGMkiLztyQ8WHl+FK55ivBNJS/BJTRnQ/dz3dfi8SbXA6cnwVM9ntVHhuKCrqWkQOBY0jfRq5PoD+Snmc8xiullw7DX/ACi/TNM08g/tB9BugqlHmXGaNrGx1s7Yh3Wu3FvK4Wq5RxaXFsGjqKgNEwcWP0iwJHVY3iU/bVWlncZsFp/s5uMvD+c78BBdg42CE1DzZCDneu3x2WO4pCS90LAO0LtI9brXzqIHY6S637j1WaY9H7tjla2RoZI52w8A4X29UDWIspoGsZ3WN58T1KgausEcsvu4DHONi5uydVtUWUrd/mPbYKJggknJ0jYcuPAQJjF3LYslU76XL1M2QaXPvJbyJ2+yzvBsMFTiFNRxi7nu+Y63DRyfotaaQ0BrQA0CwHgEDjUheGtCCUmhZLbWNxwQbH7KDx7LNJiga975I5hYCQG5sOAboQgiW5DwrvTdtM7gkvtf6J9HlLCGtDRTEDj9R3+0IQP8OwDDaCYy09MGyW03LidvDdT0YaGfCxo/tCEIFaGHfQ3/ABCEIQf/2Q==";
        expect(originalUpdated && mediumUpdated && smallUpdated).to.equal(true);

        done();
      });
  });

  it("Uploaded avatar should be save in 'uploads/imgs/avatars' directory", done => {
    fs.access(
      path.join(__dirname, `../${uploadedAvatarPath}`),
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
    // Check file if the user's avatar has been changed only

    fs.access(
      path.join(__dirname, `../${uploadedAvatarPath}`),
      fs.F_OK,
      err => {
        if (err) {
          return done();
        }

        throw new Error("File exists");
      }
    );
  });

  after(() => {
    // mongoose.connection.dropCollection("contacts");
    // mongoose.connection.dropCollection("users");
  });
});
