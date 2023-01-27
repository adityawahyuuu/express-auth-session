const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);
const https = require('https');
const fs = require('fs');

const app = express();
const host = 'localhost';
const port = 8000;
const expiresTime = 1000 * 60 * 60 * 24;
const redis = new Redis();

// Gunakan session sebagai middleware
app.use(session({
    store: new RedisStore({ client: redis }),
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
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

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.send('hello, ' + req.session.user + '!' +
    ' <a href="/logout">Logout</a>');
});

app.get('/', (req, res) => {
    res.send('<form action="/login" method="post">' +
    'Username: <input name="user"><br>' +
    'Password: <input name="pass" type="password"><br>' +
    '<input type="submit" text="Login"></form>')
});

app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
    const sess = req.session;
    const {user} = req.body;
    sess.user = user;
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) next(err)
        else res.redirect('/')
    });
});

// Listen Request
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(port, host, () => {
    console.log(`Server Running on https://${host}:${port}`);
});