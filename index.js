const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express()

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/review');
// ====================================

const clientPromise = mongoose.connect('mongodb+srv://svs_admin:vimal@cluster0.n8kbefi.mongodb.net/?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(m => m.connection.getClient());

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
    maxAge: 86400000, // 24 hours
    httpOnly: true,
  },
  store: MongoStore.create({
    clientPromise: clientPromise,
    stringify: false,
  }) 
}));

// =========================================================

app.use(authRoutes);
app.use(userRoutes);
app.use('/api/v1', reviewRoutes)

// =========================================================

app.listen(process.env.PORT || 8000, () => {
  console.log('App listening on 3000')
});