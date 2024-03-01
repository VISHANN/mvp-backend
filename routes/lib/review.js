const { getShelfId, updateShelves } = require("../lib");

function validateFormData({ name, data }) {
  switch (name) {
    case "review":
      return data.rating !== null;
  }
}

async function getReviewByWorkOLID(reviews, workId) {
  // check if user has already reviewed the work.
  for (let review of reviews) {
    if (review.work.olid === workId) {
      return review;
    }
  }
  return null;
}

function findWorkAndUpdateShelves(shelves, workId, targetShelfId) {
  // shelves are user's shelves,
  // workId is a String which identifies work at open library,
  // targetShelfId is a number getShelfId

  // Return updated shelves if success else, return null

  // find the book in shelves and move it to "have read"
  const currentShelfId = getShelfId(workId, shelves);

  // if found inside "have read". User has already done our operation
  if (currentShelfId === 2) return null;

  if (currentShelfId < 0) {
    updateShelves({
      type: "ADD",
      payload: {
        workId,
        shelves,
        targetShelfId,
      },
    });
  } else {
    updateShelves({
      type: "MOVE",
      payload: {
        workId,
        shelves,
        currentShelfId: currentShelfId,
        targetShelfId,
      },
    });
  }
}

module.exports = {
  validateFormData,
  getReviewByWorkOLID,
  findWorkAndUpdateShelves,
};
