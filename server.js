require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const passport = require('passport');
const {
    Strategy
} = require('passport-google-oauth20');

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

// Security related middleware at the top of the middlewares
app.use(helmet());
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 1 day	
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2], // two keys for session
    name: 'session',
}));
app.use(passport.initialize());
//authenticate session as right or not
app.use(passport.session());

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

//Save the session to cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//Read the session from cookie  
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

function checkLoggedIn(req, res, next) {
    const isLoggedIn = req.isAuthenticated() && req.user; //check if user is logged in using cookies
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
}), (req, res) => {
    console.log('Google called us back!!');
});

app.get('/failure', (req, res) => {
    return res.send('Failed to authenticate');
});

app.get('/auth/logout', (req, res) => {
    req.logout();       // clear any loggedin cookie Session
    res.redirect('/');
});

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