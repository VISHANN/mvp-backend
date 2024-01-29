const { OAuth2Client } = require('google-auth-library'),
  { User } = require('../mongo/models');

const GoogleClient = new OAuth2Client();
      
async function verify(token) {
  const ticket = await GoogleClient.verifyIdToken({
    idToken: token,
    audience: "732729862786-b9539gcumc7que63gif9b2d5pa4bs5mq.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();

  return new Promise((resolve, reject) => {
    if(payload) {
      resolve(payload);
    } else {
      reject({error: "Authentication Token Verification failed"});
    }
  });
}

function findOrCreate(purgedUser) {
  // WARNING: assuming its a google oauth
  // NOTE: user must be formatted according userSchema

  return new Promise((resolve, reject) => {
    User.findOneAndUpdate({'provider.providerId': purgedUser.provider.providerId}, purgedUser, {returnOriginal:false, upsert: true})
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        reject(err)
      });
  });
}
function findUser(purgedUser) {
  return new Promise((resolve, reject) => {
    User.findOne({'provider.providerId': purgedUser.provider.providerId})
      .then(user => {
        resolve(user);
      })
      .catch(err => {
        reject(err);
      })
  })
}

function purgeUser(rawUser) {
  // WARNING: assuming its a google oauth

  const purgedUser = {
    given_name: rawUser.given_name,
    family_name: rawUser.family_name,
    picture: rawUser.picture,
    provider: {
      name: 'google',
      providerId: rawUser.sub,
      email: rawUser.email, 
    }
  }
  return purgedUser;
}

module.exports = { 
  findOrCreate,
  purgeUser,
  verify,
  findUser
}