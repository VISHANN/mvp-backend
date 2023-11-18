const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { isAuthenticated } = require('./middleware');

const app = express()
const client = new OAuth2Client();

const clientPromise = mongoose.connect('mongodb+srv://svs_admin:vimal@cluster0.n8kbefi.mongodb.net/?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(m => m.connection.getClient())

// ====================================

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.use(session({  
  secret: 'some-secret-key',  
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // This will only work if you have https enabled!
    maxAge: 6000000, // 1 min
    httpOnly: true,
  },
  store: MongoStore.create({
    clientPromise: clientPromise,
    stringify: false,
  }) 
}));

async function verify(token) {
  const ticket = await client.verifyIdToken({
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

// ======================================================

const userSchema = mongoose.Schema({
  given_name: String,
  family_name: String,
  picture: String,
  provider: {
    name: String,
    providerId: String,
    email: String,
    email_verified: Boolean,
  },
});
const User = mongoose.model('User', userSchema);

// =========================================================

app.get('/api/signin', isAuthenticated, (req, res) => {
  
  const authorizationHeader = req.headers['authorization'];
  
  if (authorizationHeader.startsWith('Bearer ')) {
    const jwtToken = authorizationHeader.split(' ')[1];
    verify(jwtToken)
      .then(user => findOrCreate(purgeUser(user)))
      .then(createdUser => {
        console.log(createdUser);

        req.session.userId = createdUser._id;
        req.session.name = createdUser.given_name;
        res.json({ statusText: "SUCCESS"});
      })
      .catch(err => {
        res.json(err);
      });
  } else {
    res.send('Auth failure');
  }
})

// ====================================

app.listen(process.env.PORT || 8000, () => {
  console.log('App listening on 3000')
});