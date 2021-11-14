const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const helmet = require('helmet');
require('dotenv').config();
const passport = require('passport');
const {
    Strategy
} = require('passport-google-oauth20');

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log(profile);
    done(null, profile);
}


//Setting passport Strategy 
passport.use(new Strategy({
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, verifyCallback));

// Security related middleware at the top of the middlewares
app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if (!isLoggedIn) {
        res.status(401).json({
            error: 'You are not loggedin',
        });
    }
    next();
}

app.get('/auth/google', passport.authenticate('google', { // ask data from the google
    scope: ['profile']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false
}), (req, res) => {
    console.log('Google called us back!!');
});

app.get('/failure', (req, res) => {
    return res.send('Failed to authenticate');
});

app.get('auth/logout', (req, res) => {});

app.get('/message', checkLoggedIn, (req, res) => {
    res.send('Hello World');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(3000, () => {
    console.log('Server running on port 3000');
});