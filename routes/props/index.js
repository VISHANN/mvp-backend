const router = require("express").Router();
const { isAuthenticated } = require("../../middleware");

// Import data jsons from ./data
const accountProps = require("./data/account");

// ------------------------------------------------------

router.get("/account/edit", isAuthenticated, (req, res) => {
  // check if account props is not empty

  if (Object.keys(accountProps).length > 0) {
    res.json(accountProps);
  }
});

// ------------------------------------------------------

module.exports = router;
