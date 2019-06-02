const mongoose = require("mongoose");
const ContactModel = require("../models/contact");
const UserModel = require("../models/user");

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
    const contactaInfo = {
      firstName,
      lastName,
      phone,
      creator: userId
    };

    // Set the uploaded file as avatar or keep the default avatar
    if (file) {
      contactaInfo["avatar"] = file.path;
    }

    const contact = new ContactModel(contactaInfo);
    await contact.save();

    const user = await UserModel.findById(userId);
    user.contacts.push(userId);
    await user.save();
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
      const contactInfo = { ...req.body };
      if (file) {
        contactInfo["avatar"] = file.path;
      }
      const updatedContact = await ContactModel.findOneAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true, useFindAndModify: false }
      ).select("_id avatar firstName lastName phone");
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

      const user = await UserModel.findById(userId);

      const idx = user.contacts.indexOf(id);
      user.contacts.splice(idx, 1);
      await user.save();

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
