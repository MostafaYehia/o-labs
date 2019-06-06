const faker = require("faker");

module.exports.newValidContact = function() {
  return {
    firstName: "Ahmed",
    lastName: "Emad",
    email: "mostafayehia212@gmail.com",
    phone: "+201200127078"
  };
};

module.exports.updateValidContact = function() {
  return {
    firstName: "Ahmed",
    lastName: "Emad",
    email: "updated@gmail.com",
    phone: "+201200127078"
  };
};

module.exports.newValidContactWithAvatar = function() {
  return {
    firstName: "Ahmed",
    lastName: "Emad",
    email: "mostafayehia212@gmail.com",
    phone: "+201200127078"
  };
};

module.exports.generateDummyContacts = userId => {
  const contacts = [];

  for (let i = 0; i < 23; i++) {
    contacts.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(this.firstName, this.lastName),
      phone: "+201200127078",
      creator: userId
    });
  }

  return contacts;
};
