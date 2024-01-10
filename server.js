import express, { json } from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';


import handleRegister from './controllers/register.js';
import handleSignin from './controllers/signin.js';
import handleProfileGet from './controllers/profile.js';
import { handleImage, handleApiCall } from './controllers/image.js';

const app = express();

app.use(express.json());
app.use(cors())
app.options('*', cors())

var whitelist = ['https://smart-brain-back-end-vmuu.onrender.com', 'https://smart-brain-back-end-vmuu.onrender.com/', 'https://smart-brain-back-end-vmuu.onrender.com/imageurl', 'https://smart-brain-back-end-vmuu.onrender.com/image']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: false } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    host : process.env.DATABASE_HOST,
    port: process.env.PORT,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PW,
    database : process.env.DATABASE_DB
  }
});

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => { res.send(db.users) })
app.post('/signin', (req, res) => { handleSignin(req, res, db, bcrypt) })
app.post('/register', (req, res) => { handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { handleProfileGet(req, res, db)})
app.put('/image', cors(corsOptionsDelegate), (req, res) => { handleImage(req, res, db)})
app.post('/imageurl', cors(corsOptionsDelegate), (req, res) => { handleApiCall(req, res, imageUrl)})


app.listen(PORT, function () {
  console.log(`Server is running on port : ${PORT}`);
});
