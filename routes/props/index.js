const router = require("express").Router();
const { isAuthenticated } = require("../../middleware");

// Import data jsons from ./data
const accountProps = require("./data/account");
const reviewProps = require("./data/review");

// ------------------------------------------------------

// serve account props for /settings page
router.get("/account/edit", isAuthenticated, (req, res) => {
  // check if account props is not empty

  if (Object.keys(accountProps).length > 0) {
    res.json(accountProps);
  }
});

// serve review props for creting or editing reviews
router.get("/review", (req, res) => {
  res.json(reviewProps);
});
// ------------------------------------------------------

module.exports = router;
