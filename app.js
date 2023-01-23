var express = require('express')
var session = require('express-session')

const app = express();
const host = 'localhost';
const port = 8080;

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// Buat Middleware Strategy Autentikasi
const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else next('route');
}

app.get('/', isAuthenticated, (req, res) => {
    res.send('hello, ' + req.session.user + '!' +
    ' <a href="/logout">Logout</a> ' + req.sessionID);
})

app.get('/', (req, res) => {
    res.send(req.sessionID + '<br>' + '<form action="/login" method="post">' +
    'Username: <input name="user"><br>' +
    'Password: <input name="pass" type="password"><br>' +
    '<input type="submit" text="Login"></form>')
})

app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
    req.session.regenerate(err => {
        if (err) next(err);

        req.session.user = req.body.user;
        req.session.save(err => {
            if (err) return next(err);
            else res.redirect('/');
        })
    })
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) next(err)
        else res.redirect('/')
    })
})

app.listen(port, host, () => {
    console.log(`Server Running on http://${host}:${port}`);
});