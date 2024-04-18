const { Work } = require("../mongo/models");

const express = require("express"),
  router = express.Router();

const errors = require("../codes/error.json");

// ---------------------------------------------------------------------

router.get("/work/olid/:olid/reviews", async (req, res) => {
  const olid = req.params.olid;

  const work = await Work.findOne({ olid }).populate({
    path: "reviews",
    select: ["rating", "text"],
    populate: {
      path: "author",
      select: ["picture", "given_name", "username"],
    },
  });

  if (!work) {
    // No such work exists, means no reviews exist for work
    return res.status(404).json({
      code: errors.work_not_found,
      text: "This work has not been created yet. Thus has not been reviewed yet.",
    });
  }

  return res.json(work.reviews);
});

// ---------------------------------------------------------------------

module.exports = router;
