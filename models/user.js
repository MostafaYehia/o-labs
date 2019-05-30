let mongoose = require("mongoose");
let Schema = mongoose.Schema;

//User schema definition
let UserSchema = new Schema(
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
      required: [true, "you should enter your email"]
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

// Sets the createdAt parameter equal to the current time
UserSchema.pre("save", next => {
  now = new Date();
  if (!this.createdAt) this.createdAt = now;
  next();
});

module.exports = mongoose.model("User", UserSchema);
