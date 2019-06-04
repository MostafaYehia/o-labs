module.exports.validUser = function() {
    return {
      username: "Mostafa Yehia",
      email: "mostafayehia212@gmail.com",
      password: "@Password7"
    };
  };
  
  module.exports.invalidUser = function() {
    return {
      name: "Mostafa Yehia",
      email: "mostafayehia212.com",
      password: "123456789"
    };
  };
  