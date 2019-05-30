let mongoose = require("mongoose");
let Schema = mongoose.Schema;

//Contact schema definition
let ContactSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "you should enter your first name"]
    },
    lastName: {
      type: String,
      required: [true, "you should enter your last name"]
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      },
      max: [30, "No more than 30 number"],
      required: [true, "you should enter your email"]
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{3}-\d{4}-\d{4}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required: [true, "you should enter your phone number"]
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

// Sets the createdAt parameter equal to the current time
ContactSchema.pre("save", next => {
  now = new Date();
  if (!this.createdAt) this.createdAt = now;
  next();
});

module.exports = ContactSchema
