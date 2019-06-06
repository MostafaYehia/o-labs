const mongoose = require("mongoose");
const ContactModel = require("../models/contact");
const imagesController = require("../controllers/images");
const fs = require("fs").promises;
const path = require("path");

const baseaPath = path.join(__dirname, "..", "uploads/imgs/avatars");

exports.getPaginatedContacts = async (req, res) => {
  try {
    // Get all contacts
    const { userId } = req;
    const { page, sortBy } = req.query;

    if (page == undefined || +page < 1)
      return res
        .status(400)
        .json({ message: "page param is required with at leats 1" });

    let paginatedContacts = ContactModel.paginatedContacts(userId, page);

    if (sortBy) {
      paginatedContacts = ContactModel.sortBy(paginatedContacts, sortBy);
    }

    paginatedContacts = await paginatedContacts;

    res.status(200).json({ contacts: paginatedContacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, phone, email } = req.body;
    let contactInfo = {
      firstName,
      lastName,
      phone,
      email,
      creator: userId
    };

    // Resize avatar for medium size version
    const contact = new ContactModel(contactInfo);
    await contact.save();

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
      let contactInfo = { ...req.body, id };
      if (file) {
        contactInfo["avatars"] = {};
        contactInfo = await setAvatars(contactInfo, file);
      }

      const updatedContact = await ContactModel.findOneAndUpdate(
        id,
        { ...contactInfo },
        { new: true, runValidators: true, useFindAndModify: false }
      )
        .select("_id avatars firstName lastName phone email")
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

    const validId = mongoose.Types.ObjectId.isValid(id);
    // Delete
    if (validId) {
      await ContactModel;
      const user = await ContactModel.findById(id);
      const removedContact = await ContactModel.findByIdAndDelete({
        _id: id
      }).orFail(new Error("No contact found"));

      const originalAvatarPath =
        "uploads/imgs/avatars/1559520000-o-labs-avatar.png";
      const userAvatarPath = removedContact.avatars.original;

      if (userAvatarPath !== originalAvatarPath) {
        const deleted = await fs.unlink(
          path.join(__dirname, `../${userAvatarPath}`)
        );
      }

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

function setAvatars(doc, file) {
  return new Promise(async (resolve, reject) => {
    const sizes = [
      {
        type: "medium",
        width: 100
      },
      {
        type: "small",
        width: 50
      }
    ];
    try {
      doc["avatars"].original = file.path;
      for (const size of sizes) {
        doc["avatars"][size.type] = await imagesController.resize(
          doc.id,
          file.path,
          size.width,
          size.type
        );
      }
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
}
