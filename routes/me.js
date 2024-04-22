const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const { User } = require("../mongo/models");

// -----------------------------------------------------------------

router.get("/me/shelves", isAuthenticated, (req, res) => {
  // Write successful response status 200 in the header
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "*",

    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
  });

  // Get all user shelves, where each shelf is an array of work OLIDs
  User.findOne({ _id: req.session.user._id }).then((user) => {
    const { shelves } = user;
    let shelf;

    for (i = 0; i < 4; i++) {
      shelf = shelves[`${i}`];
      res.write(`data: ${JSON.stringify(shelf)}\n\n`);
    }

    res.end();
  });

});

router.get("/me/shelves/:shelfId", isAuthenticated, (req, res) => {
  const shelfId = req.params.shelfId;

})

// -----------------------------------------------------------------

module.exports = router;
