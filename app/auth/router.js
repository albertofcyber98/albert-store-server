const router = require('express').Router();
const authController = require('./controller');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// new LocalStrategy instansiasi, secara default di LocalStrategy menerima kolum username dan password
// usernameField(object) name field default diganti email
passport.use(new LocalStrategy({usernameField: 'email'}, authController.localStrategy));
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;