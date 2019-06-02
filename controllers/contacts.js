const mongoose = require("mongoose");
const ContactModel = require("../models/contact");
const UserModel = require("../models/user");
const imagesController = require("../controllers/images");

exports.getAllContacts = async (req, res) => {
  try {
    // Get all contacts
    const { userId } = req;
    const contacts = await ContactModel.find(
      { creator: userId },
      "-countryCode -nationalFormat -internationalFormat -creator"
    );
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { userId, file } = req;

    const { firstName, lastName, phone } = req.body;
    let contactInfo = {
      firstName,
      lastName,
      phone,
      creator: userId
    };

    // Set the uploaded file as avatar or keep the default avatar
    if (file) {
      contactInfo["avatars"] = {};
      contactInfo["avatars"] = await this.setAvatars(contactInfo, file);
    }
    // Resize avatar for medium size version
    let contact = new ContactModel(contactInfo);
    await contact.save();

    contact;
    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message || error });
  }
};

exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ContactModel.findById(
      id,
      "-countryCode -nationalFormat -internationalFormat"
    ).orFail(new Error("No contact found"));

    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { file } = req;

    const validId = mongoose.Types.ObjectId.isValid(id);

    if (validId) {
      let contactInfo = { ...req.body };
      if (file) {
        contactInfo["avatars"] = {};
        contactInfo = this.setAvatars(contactInfo, file);
      }
      const updatedContact = await ContactModel.findOneAndUpdate(
        id,
        { ...contactInfo },
        { new: true, runValidators: true, useFindAndModify: false }
      )
        .select("_id avatar firstName lastName phone")
        .exec();
      return res.status(200).json({ contact: updatedContact });
    } else {
      throw new Error("Invalid id");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const validId = mongoose.Types.ObjectId.isValid(id);
    // Delete
    if (validId) {
      await ContactModel.findByIdAndDelete({ _id: id }).orFail(
        new Error("No contact found")
      );
      res
        .status(200)
        .json({ message: "Contact has been deleted successfully!" });
    } else {
      throw new Error("Invalid id");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setAvatars = (doc, file) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mediumSizePath = await imagesController.resize(
        file.path,
        "medium",
        100
      );
      const smallSizePath = await imagesController.resize(file.path, "small", 50);
      doc["avatars"].default = file.path;
      doc["avatars"].medium = mediumSizePath;
      doc["avatars"].small = smallSizePath;
      return resolve(doc["avatars"]);
    } catch (error) {
      reject(error)
    }
  })
};
