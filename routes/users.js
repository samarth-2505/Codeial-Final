const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');

router.get('/profile/:id', passport.checkAuthentication ,usersController.profile); //before opening the profile page, check if the user has been authenticated or not

router.post('/update/:id', passport.checkAuthentication ,usersController.update);

router.get('/sign-up', usersController.signUp);

router.get('/sign-in', usersController.signIn);

router.post('/create', usersController.create);

//use passport as a middleware to authenticate
router.post('/create-session',passport.authenticate(
 'local', //strategy used to authenticate
 {failureRedirect : '/users/sign-in'}
),usersController.createSession);

router.get('/sign-out',usersController.destroySession);

//using google oauth 2 strategy for authenticating
router.get('/auth/google', passport.authenticate('google', 
{scope : ['profile', 'email']}
));
router.get('/auth/google/callback', passport.authenticate(
'google', 
{failureRedirect : '/users/sign-in'}
), usersController.createSession);

module.exports = router;