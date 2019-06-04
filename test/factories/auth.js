module.exports.validUser = function() {
  return {
    username: "Mostafa Yehia",
    email: "mostafayehia212@gmail.com",
    password: "@Password7"
  };
};

module.exports.invalidUserPassword = function() {
  return {
    username: "Mostafa Yehia",
    email: "mostafayehia212@gmail.com",
    password: "123"
  };
};

module.exports.invalidUserEmail = function() {
  return {
    username: "Mostafa Yehia",
    email: "mostafayehia212.com",
    password: "@Password7"
  };
};

module.exports.invalidUserUsername = function() {
  return {
    name: "Mostafa Yehia",
    email: "unique_email@gmail.com",
    password: "@Password7"
  };
};
