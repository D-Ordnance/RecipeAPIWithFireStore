const functions = require('firebase-functions');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const cors = require('cors');
const app = express();

var serviceAccount = require('./deeosoft-api-permission.json');

initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

app.use(cors({ origin: true }));

app.get('/login-user', (req, res) => {
    return res.status('200').send("User logged In here");
});

app.post('/api/create', (req, res) => {
    createCollection("items", req.body.id, { item: req.body.item }).then(data => {
        res.status('200').send(data);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

app.post('/api/registerUser', (req, res) => {
    registerUser(req.body.email + req.body.password, req.body).then(data => {
        res.status(200).send(data)
    }).catch(err => {
        res.status(500).send(err)
    });
});

app.post('/api/login', (req, res) => {
    getUserByDoc(req.body.email + req.body.password).then(data => {
        if (data.exists) {
            res.status(200).send({
                success: true,
                message: "User Exist",
                data: data.data()
            })
        } else {
            res.status(500).send({
                success: false,
                message: "User does not exist",
                data: {}
            })
        }

    }).catch(err => {
        res.status(500).send(err)
    });
});

function createCollection(collection, doc, data) {
    var createCollectionPromise = new Promise((resolve, reject) => {
        try {
            db.collection(collection).doc(doc).set(data);
            resolve("Inserted successfully");
        } catch (e) {
            reject("An error occurred with: " + e);
        }

    });
    return createCollectionPromise;
}

function registerUser(doc, data) {
    var registerUser = new Promise((resolve, reject) => {
        getUserByDoc(doc).then(newData => {
            if (newData.exists) {
                reject({
                    success: false,
                    data: {},
                    message: "User already exist"
                });
            } else {
                try {
                    db.collection('User').doc(doc).set(data);
                    resolve({
                        success: true,
                        data: data,
                        message: "Successful"
                    })
                } catch (error) {
                    reject({
                        success: false,
                        data: {},
                        message: error
                    });
                }
            }
        })
            .catch(err => {
                reject({
                    success: false,
                    data: {},
                    message: err.message
                });
            });
    });

    return registerUser;
}

function getUserByDoc(doc) {
    var getUserByDoc = new Promise((resolve, reject) => {
        try {
            var userDoc = db.collection('User').doc(doc).get()
            resolve(userDoc)
        } catch (err) {
            reject({
                success: false,
                data: {},
                message: err
            });
        }

    });
    return getUserByDoc;
}

exports.app = functions.https.onRequest(app);
