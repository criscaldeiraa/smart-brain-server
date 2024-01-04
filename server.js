import express, { json } from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';

import handleRegister from './controllers/register.js';
import handleSignin from './controllers/signin.js';
import handleProfileGet from './controllers/profile.js';
import { handleImage, handleApiCall } from './controllers/image.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; 

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    host : process.env.DATABASE_HOST,
    port: 5432,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PW,
    database : process.env.DATABASE_DB
  }
});

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors())
app.use(json());

app.get('/', (req, res)=> { res.send(db.users) })
app.post('/signin', handleSignin(db, bcrypt))
app.post('/register', (req, res) => { handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { handleProfileGet(req, res, db)})
app.put('/image', (req, res) => { handleImage(req, res, db)})
app.post('/imageurl', (req, res) => { handleApiCall(req, res)})


app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
