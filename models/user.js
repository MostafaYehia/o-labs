const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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

// Hash password;
UserSchema.methods.hashPassword = function(password) {
  return new Promise(async (resolve, reject) => {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      resolve(hash);
    } catch (error) {
      reject(hash);
    }
  });
};

// Check user password on authentication
UserSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Genrate JWT
UserSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username, verified: this.isVerified },
    "blackswan",
    { expiresIn: "1h" }
  );
};

// Sets the createdAt parameter equal to the current time
UserSchema.pre("save", async function(next) {
  try {
    // // Set creation date
    let now = new Date();
    if (!this.createdAt) this.createdAt = now;

    // only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();
    this.password = await this.hashPassword(this.password);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
