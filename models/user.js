const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const contactSchema = require("./contact");
const saltRounds = 10;

//User schema definition
let UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "you should enter a username"]
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      },
      required: [true, "you should enter your email"]
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    contacts: [contactSchema],
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

// Check user password on authentication
UserSchema.methods.checkPassword = password => {
  return bcrypt.compareSync(password, this.password);
};

// Genrate JWT
UserSchema.methods.generateToken = password => {
  return jwt.sign(
    { id: this._id, username: this.username, verified: this.isVerified },
    "blackswan",
    {
      expiresIn: "1h"
    }
  );
};

// Sets the createdAt parameter equal to the current time
UserSchema.pre("save", next => {
  // Hash user's passowrd
  this.password = bcrypt.hashSync(this.password, saltRounds);

  // Set creation date
  now = new Date();
  if (!this.createdAt) this.createdAt = now;

  next();
});

module.exports = mongoose.model("User", UserSchema);
