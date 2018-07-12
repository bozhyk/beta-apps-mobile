const express                 = require('express'),
      path                    = require('path'),
      appRoot                 = require('app-root-path'),
      app                     = express(),
      passport                = require('passport'),
      LocalStrategy           = require('passport-local'),
      User                    = require('./models/user'),
      bodyParser              = require('body-parser'),
      cors                    = require('cors'),
      compression             = require('compression'),
      api                     = require('./routes/api'),
      config                  = require('./config')

// REPLACEME: MemoryStore is not designed for a production environment
app.use(require('express-session')({
  secret: 'Qooco app secret expression',
  resave: false,
  saveUninitialized: false
}));

app.use(compression());
app.use(cors());
app.use(bodyParser.json());

// Set our api routes
app.use('/api', api);

app.set('port', config.port);

app.use(passport.initialize());
app.use(passport.session());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// passport/login.js
passport.use('login', new LocalStrategy({
  passReqToCallback : true
},
function(req, username, password, done) {
  // check in mongo if a user with username exists or not
  User.findOne({ 'username' :  username },
    function(err, user) {
      // In case of any error, return using the done method
      if (err)
        return done(err);
      // Username does not exist, log error & redirect back
      if (!user){
        console.log('User Not Found with username '+username);
        return done(null, false,
              req.flash('message', 'User Not found.'));
      }
      // User exists but wrong password, log the error
      if (!isValidPassword(user, password)){
        console.log('Invalid Password');
        return done(null, false,
            req.flash('message', 'Invalid Password'));
      }
      // User and password both match, return user from
      // done method which will be treated like success
      return done(null, user);
    }
  );
}));
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}


passport.use('signup', new LocalStrategy({
  passReqToCallback : true
},
function(req, username, password, done) {
  findOrCreateUser = function(){
    // find a user in Mongo with provided username
    User.findOne({'username':username},function(err, user) {
      // In case of any error return
      if (err){
        console.log('Error in SignUp: '+err);
        return done(err);
      }
      // already exists
      if (user) {
        console.log('User already exists');
        return done(null, false,
           req.flash('message','User Already Exists'));
      } else {
        // if there is no user with that email
        // create the user
        var newUser = new User();
        // set the user's local credentials
        newUser.username = username;
        newUser.password = createHash(password);
        newUser.email = req.param('email');
        newUser.firstName = req.param('firstName');
        newUser.lastName = req.param('lastName');

        // save the user
        newUser.save(function(err) {
          if (err){
            console.log('Error in Saving user: '+err);
            throw err;
          }
          console.log('User Registration succesful');
          return done(null, newUser);
        });
      }
    });
  };

  // Delay the execution of findOrCreateUser and execute
  // the method in the next tick of the event loop
  process.nextTick(findOrCreateUser);
}));
// Generates hash using bCrypt
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
 }


// Run the app by serving the static files
// in the dist directory

app.use(express.static(path.join(appRoot.path, 'dist')));

if (!config.ios_apps_dir.startsWith(appRoot.path)) {
	app.use("/data/ios/files/", express.static(config.ios_apps_dir));
}

if (!config.android_apps_dir.startsWith(appRoot.path)) {
	app.use("/data/android/files/", express.static(config.android_apps_dir));
}

app.use("/data/ios/", express.static(path.resolve(appRoot.path, "./data/ios/")));
app.use("/data/android/", express.static(path.resolve(appRoot.path, "./data/android/")));

module.exports = app;
