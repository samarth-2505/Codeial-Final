const express = require('express');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db=require('./config/mongoose');
const cookieParser=require('cookie-parser');
//used for session cookie
const session=require('express-session');
//used for authenticating the user
const passport=require('passport');
const passportJWT = require('./config/passport-jwt-strategy');
const passportLocal=require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth-2-strategy');
const MongoStore = require('connect-mongo');
const sassMiddleware= require('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

//middleware to take scss files from source and put them as css files in the destination
app.use(sassMiddleware({
 src : './assets/scss',
 dest : './assets/css',
 debug : true ,
 outputStyle : 'extended',
 prefix : '/css'
}));

app.use(express.urlencoded());

app.use(express.static('./assets'));
app.use(cookieParser());

//make the uploads path available to the browser
app.use('/uploads',express.static(__dirname + '/uploads'));

app.use(expressLayouts);
//extract style and scripts from sub pages into the layout
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//just after setting the views we'll set up our middleware for the express session
app.use(session({
 name : 'codeial',
 //TODO - change the secret key before deployment in the production mode
 secret : 'blahblah', //this key is used to encrypt our key(that has been passed while serilizing) before storing it in the session cookie
 saveUninitialized : false,
 resave : false,
 cookie : {
     maxAge : (1000 * 60 * 100) //takes values in ms - here maxAge is 100 minutes 
 },
 //mongo store is used to store the session cookie in the db
 store: MongoStore.create(
    {
        mongoUrl : 'mongodb://localhost/codeial_development',
        autoRemove: 'disabled'
    
    },
    function(err){
        console.log(err ||  'connect-mongodb setup ok');
    }
)

}));

//use passport
app.use(passport.initialize());
//use passport session
app.use(passport.session());

//call the setAuthenticatedUser function in passport-local-strategy.js file
app.use(passport.setAuthenticatedUser);

//middleware for displaying flash messages
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/', require('./routes'));

app.listen(port, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running on port: ${port}`);
});
