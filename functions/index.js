const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({origin: true}));

app.get('/login-user', (req, res) => {
    console.log("what is req: ", req);
    return res.status('200').send("User logged In here.....");
});

exports.app = functions.https.onRequest(app);
