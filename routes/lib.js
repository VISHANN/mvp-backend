const { OAuth2Client } = require("google-auth-library"),
  { User } = require("../mongo/models");

const GoogleClient = new OAuth2Client();

async function verify(token) {
  const ticket = await GoogleClient.verifyIdToken({
    idToken: token,
    audience:
      "732729862786-b9539gcumc7que63gif9b2d5pa4bs5mq.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();

  return new Promise((resolve, reject) => {
    if (payload) {
      resolve(payload);
    } else {
      reject({ error: "Authentication Token Verification failed" });
    }
  });
}

function findOrCreate(purgedUser) {
  // WARNING: assuming its a google oauth
  // NOTE: user must be formatted according userSchema

  return new Promise((resolve, reject) => {
    User.findOneAndUpdate(
      { "provider.providerId": purgedUser.provider.providerId },
      purgedUser,
      { returnOriginal: false, upsert: true }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function findUser(purgedUser) {
  return new Promise((resolve, reject) => {
    User.findOne({ "provider.providerId": purgedUser.provider.providerId })
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function purgeUser(rawUser) {
  // WARNING: assuming its a google oauth
  // WARNING: username won't be defined a unregistered user calls /api/v1/signin

  const purgedUser = {
    given_name: rawUser.given_name,
    family_name: rawUser.family_name,
    picture: rawUser.picture,
    username: rawUser.username,
    provider: {
      name: "google",
      providerId: rawUser.sub,
      email: rawUser.email,
    },
  };
  return purgedUser;
}

function updateShelves({ type, payload }) {
  const { workId, shelves, currentShelfId, targetShelfId } = payload;
  let currentShelf, targetShelf;

  switch (type) {
    case "MOVE":
      (currentShelf = shelves[currentShelfId]),
        (targetShelf = shelves[targetShelfId]);

      currentShelf.splice(currentShelf.indexOf(workId), 1);
      targetShelf.push(workId);
      break;

    case "REMOVE":
      currentShelf = shelves[currentShelfId];

      // if currentShelf not defined return error object.
      currentShelf.splice(currentShelf.indexOf(workId), 1);
      break;

    case "ADD":
      targetShelf = shelves[targetShelfId];

      // if targetShelf not defined return error object.
      targetShelf.push(workId);
      break;
  }
  return shelves;
}

function getShelfId(workId, shelves) {
  for (let [shelfId, shelf] of Object.entries(shelves)) {
    if (shelf.includes(workId)) {
      return shelfId;
    }
  }

  // return -1 if work not found in any shelf
  return -1;
}

module.exports = {
  findOrCreate,
  purgeUser,
  verify,
  findUser,
  updateShelves,
  getShelfId,
};
