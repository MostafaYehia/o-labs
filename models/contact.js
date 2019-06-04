let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let mongooseIntlPhoneNumber = require("mongoose-intl-phone-number");

//Contact schema definition
let ContactSchema = new Schema(
  {
    firstName: {
      type: String,
      max: 20,
      required: [true, "you should enter your first name"]
    },
    lastName: {
      type: String,
      max: 20,
      required: [true, "you should enter your last name"]
    },
    phone: {
      type: String,
      max: 30,
      validate: {
        validator: function(v) {
          return /\d{11}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required: [true, "you should enter your phone number"]
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
    avatars: {
      original: {
        type: String,
        default: "uploads/imgs/avatars/1559520000-o-labs-avatar.png"
      },
      medium: {
        type: String,
        default: "uploads/imgs/avatars/1559520000-o-labs-avatar-medium.png"
      },
      small: {
        type: String,
        default: "uploads/imgs/avatars/1559520000-o-labs-avatar-small.png"
      }
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

// Static methods
ContactSchema.statics.paginatedContacts = function(userId, page) {
  return this.model("Contact")
    .find(
      { creator: userId },
      "-countryCode -nationalFormat -internationalFormat -creator"
    )
    .skip((page - 1) * 10)
    .limit(10);
};

ContactSchema.statics.sortBy = function(paginatedDocsPromise, sortType) {
  return paginatedDocsPromise.sort({ sortType: 1 });
};

module.exports = mongoose.model("Contact", ContactSchema);
