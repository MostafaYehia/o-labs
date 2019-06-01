var express = require("express");
var router = express.Router();

// Contacts
const contactsController = require("../controllers/contacts");

/* GET contacts listing. */
router
  .get("/contacts", contactsController.getAllContacts)
  .post("/contacts", contactsController.createContact)
  .get("/contacts/:id", contactsController.getContact)
  .put("/contacts/:id", contactsController.updateContact)
  .delete("/contacts/:id", contactsController.deleteContact);

module.exports = router;
