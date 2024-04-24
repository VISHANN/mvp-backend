const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const { User } = require("../mongo/models");
const { getPublication } = require('./lib/me');

// -----------------------------------------------------------------

const headers = {
  "Content-Type": "text/event-stream",
  "Access-Control-Expose-Headers": "*",
  "Connection": "keep-alive",
  "Cache-Control": "no-cache",
};

// -----------------------------------------------------------------

router.get("/me/shelves", isAuthenticated, (req, res) => {
  // Write successful response status 200 in the header
  res.writeHead(200, headers);

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

router.get("/me/shelves/:shelfId", isAuthenticated, async (req, res) => {
  const shelfId = req.params.shelfId;
  const userId = req.session.user._id;

  try {
    res.writeHead(200, headers);

    // find user and get its shelf
    const user = await User.findOne({ _id: userId });

    let shelf = user.shelves[shelfId];

    // Loop through shelf and fetch work meta data from openlibrary of 
    for (workOLID of shelf) {
      const work = await fetchWork(workOLID);

      // add publication to work meta data
      work.publication = await getPublication(workOLID);

      res.write(`data: ${JSON.stringify(work)}\n\n`);
    }

    req.on('close', () => {
      res.end();
    });
  } catch (error) {
    console.log(error);
  }
})

// -----------------------------------------------------------------

// helper functions

async function fetchWork(workOLID) {
  return await fetch(`https://openlibrary.org/works/${workOLID}.json`)
    .then(res => res.json());
}
// -----------------------------------------------------------------

module.exports = router;
