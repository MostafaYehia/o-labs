const express = require("express");
const router = express.Router();
const contactsController = require("../controllers/contacts");
const uploadsController = require("../controllers/uploads");

// Config file storage for avatars
const fileTypes = ["jpg", "jpeg", "png"];
const folderPath = "uploads/imgs/avatars/";
let uploader = uploadsController.configFileStorage(
  "avatar",
  folderPath,
  fileTypes
);

/* GET contacts listing. */
router
  .get("/contacts", contactsController.getAllContacts)
  .post(
    "/contacts",
    uploadsController.errorHandler(uploader),
    contactsController.createContact
  )
  .get("/contacts/:id", contactsController.getContact)
  .put(
    "/contacts/:id",
    uploadsController.errorHandler(uploader),
    contactsController.updateContact
  )
  .delete("/contacts/:id", contactsController.deleteContact);

module.exports = router;
