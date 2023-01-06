const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

const wrapAsync = require('../utils/catchAsync');
const passport = require('passport');

router.route('/register')
    .get(users.registerForm)
    .post(wrapAsync(users.registerUser))

router.route('/login')
    .get(users.loginForm)
    .post(passport.authenticate('local', { keepSessionInfo: true, failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router;