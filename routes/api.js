var express = require("express");
var router = express.Router();

// Contacts
const contactsController = require('../controllers/contacts');

/* GET contacts listing. */
router
.get("/contacts", contactsController.getAllContacts)
.get("/contacts/:id", contactsController.getContact)
.post("/contacts", contactsController.createContact)
.put("/contacts/:id", contactsController.updateContact)
.delete("/contacts/:id", contactsController.deleteContact)

module.exports = router;
