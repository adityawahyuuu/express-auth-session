const express = require('express');
const session = require('express-session');
const https = require('https');
const fs = require('fs');

const app = express();
const host = 'localhost';
const port = 8443;
const expiresTime = 1000 * 60 * 60 * 24;
// const expiresTime = 1000 * 10;

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: expiresTime
    }
}));

// Buat Middleware Strategy Autentikasi
const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else next('route');
};

app.get('/', isAuthenticated, (req, res) => {
    res.send('hello, ' + req.session.user + '!' +
    ' <a href="/logout">Logout</a> ' + req.sessionID + ' <a href="/about">about</a>');
});


app.get('/', (req, res) => {
    res.send('<form action="/login" method="post">' +
    'Username: <input name="user"><br>' +
    'Password: <input name="pass" type="password"><br>' +
    '<input type="submit" text="Login"></form>')
});

app.get('/about', isAuthenticated, (req, res) => {
    res.send('This is about of, ' + req.session.user + '!' +
    ' <a href="/">Main Page</a> ' + req.sessionID);
});

app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
    req.session.regenerate(err => {
        if (err) next(err);
        else{
            req.session.user = req.body.user;
            res.redirect('/');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) next(err)
        else res.redirect('/')
    });
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(port, host, () => {
    console.log(`Server Running on https://${host}:${port}`);
});