exports.getAllContacts = (req, res) => {
  res.status(200).json({ contacts: [] });
};

exports.getContact = (req, res) => {
  res.status(200).json({ contact: req.params.id });
};

exports.createContact = (req, res) => {
  res.status(200).json({ contact: { token: "1312312" } });
};

exports.updateContact = (req, res) => {
  res.status(200).json({ contact: req.params.id });
};

exports.deleteContact = (req, res) => {
  res.status(200).json({ contact: req.params.id });
};
