const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if (!isLoggedIn) {
        res.status(401).json({
            error: 'You are not loggedin',
        });
    }
    next();
}

app.get('/auth/google',(req, res) => {});

app.get('/auth/google/callback',(req, res) => {});

app.get('auth/logout',(req, res) => {});    

app.get('/message', checkLoggedIn, (req, res) => {
    res.send('Hello World');
});

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(3001, () => {
    console.log('Server running on port 3001');
});