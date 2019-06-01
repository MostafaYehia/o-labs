const mongoose = require("mongoose");
const contactModel = require("../models/contact");
const authController = require("../controllers/auth");

exports.getAllContacts = async (req, res) => {
  try {
    // Get all contacts
    const contacts = await contactModel.find({});
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, phone } = req.body;
    // Get creator id;
    const contact = new contactModel({
      firstName,
      lastName,
      phone,
      creator: userId
    });

    await contact.save();
    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message || error });
  }
};

exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactModel
      .findById(id, "-countryCode -nationalFormat -internationalFormat")
      .orFail(new Error("No contact found"));

    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await contactModel.findOneAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ contact: updatedContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    // Delete
    if (validId) {
      await contactModel
        .findByIdAndDelete({ _id: id })
        .orFail(new Error("No contact found"));

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
