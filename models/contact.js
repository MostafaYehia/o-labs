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
        default: "data:image/jpg;base64,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"
      },
      small: {
        type: String,
        default: "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAsCAIAAACogXwNAAAACXBIWXMAAAsSAAALEgHS3X78AAADbklEQVRYw+2XS2gTURSGI7bStKXGNmBN2nQmM5lJpjNpGvPQNqV5PyaPttBHal9pU6sr0YWuRZBSQTc+VhahCoKIqBvRvaKgWBVxYamLWu1K0OpS8c9Ea2lFSCSJ4MAhnDv3H+7HuWf+e6NoNoT/wVDIWDKWjCVj/X9YAhPimZCJjiB4KS89lmAIkfoopY/ajAEEEr0+yhtCpcTiDWFAjNsdj/pql0YqEQ/76lJ2h0RWIizsHep0uK3169SWq1HdAaft4J7d12KN36YUh9qsmBL+YjcVedcJnWRlg+9SymkvV6frpqjM9iE55TMup5StbDDTakXGQiUIfWzSaX8/VmFhg5whgieC1PhgXUlVpB12Uh/Lu2B5YpmZUAMRP+HmXgxuN9KR9VMgezlYc7yzGQJz8bG0RHzaY5ofULG0uH6KpSPPkqqTbk5bEiwdGT/mMi8MV2PI/XzOSW23OFx11NWiI2PFxsLaNCXGLB0f0+V+wc1QIggQSAJC56d0WbSlAwK+JL5loMT5pAqmoMaXKBkpkuvxhqdJFZhK5ltYu9+690t6682EFp8e4lZC+zld1mdtA3EJfCvbNLAA2BVc9EGvenlUibjfq55y2vAQU2uyYmChXeAIWiLB0CLK83a08mKY3NWUcBr9CCSzYXJptHLCYYcAMmNepqrIlQmLuTjvuQD9al/N6kTZ5QiBISfZFQJJB+e9IjatTpRDcDZgaOe8eIUvHFa2Tk6T//VQNSzgtI/18h7YBLuuHrzkW3jo5d1nfMyb4SqI8UquNVPkaqEzPuPiSBWW0RAJEAgSygZ6QYLTSDsI8YzXmKu15oaFlW53aW7EGzREHIcx/8fSQgA9xHgFSaGwBOkcvNuzc04kVI09LZJ//tYFeGkKAsjmxKZ7PfV4UShotWYjJO4t3ZZ2OBO2BhbK/mj2TCDBUE9FMQVBl8UF8aUIWcBqZdu5s9lzp7senvk8qboQpCcddg/vsbGBViaIQIIhjON8gMaBDRnEbt7DFq7l1wwCVokjDws/7q9dGav4ML5taUS5MFSNjw4Jhnj4ZGAHoCGDmKEKaRC/PjQmJO1gAr8Okx87BWc/0m5B7HfaMIQjrAky/4uKeSZmewUWgLVxc8dlFYEEw+zF0Fz8M3GzUWUvzZttTP5XLWPJWDKWjCVjbYzvDNtUrT1/iHsAAAAASUVORK5CYII="
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


module.exports = mongoose.model("Contact", ContactSchema);
