let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let mongooseIntlPhoneNumber = require("mongoose-intl-phone-number");

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
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{11}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required: [true, "you should enter your phone number"]
    },
    avatar: {
      type: String,
      default: "uploads/imgs/avatars/default.jpg"
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: [true, "you should provide the current user id"]
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

// Run validation on update
ContactSchema.pre("findOneAndUpdate", function(next) {
  this.options.runValidators = true;
  next();
});

// Plugins
ContactSchema.plugin(mongooseIntlPhoneNumber, {
  hook: "validate",
  phoneNumberField: "phone",
  nationalFormatField: "nationalFormat",
  internationalFormat: "internationalFormat",
  countryCodeField: "countryCode"
});

module.exports = mongoose.model("Contact", ContactSchema);
