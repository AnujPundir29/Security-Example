const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.get('/message', (req, res) => {
    res.send('Hello World');
});

app.get('/*', (req, res) => {
    res.send('this is the homepage');
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(3001, () => {
    console.log('Server running on port 3000');
});