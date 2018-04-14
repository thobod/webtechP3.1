var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var file = "products.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

//debug handling
const debug = require('debug')('webtechP3.1');
const name = 'Webshop';
debug('booting %s and passport.js', name);

// ES6 class to represent the user
var User = class {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
  validPassword(password) {
    return this.password === password;
  }
}

//return the id from the user to the callback funtion
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // get user by id and return it to the callback funtion
  db.get('SELECT id, email FROM Users WHERE id = ?', id, function(err, row) {
    if (err) {
      console.log(err.message);
      return done(err);
    }
    if (!row) {
      console.log("something went wrong with deserializing user");
      return done(null, false);
    }
    return done(null, row);
  });
});

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  db.get('SELECT id, email FROM Users WHERE email = ? AND password = ?', email, password, function(err, row) {
    if (err) {
      return done(err);
    }
    if (!row) {
      return done(null, false);
    }
    return done(null, row);
  });
}));

// method that we will use to sign up
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  // check if the email already exists
  db.get('SELECT id, email FROM Users WHERE email = ?', email, function(err, row) {
    if (err) {
      console.log(err.message);
      return done(err);
    }
    if (row) {
      console.log("already exists");
      console.log(row);
      return done(null, false, {message: 'Email is already in use.'});
    }
    // email does not exist yet
    console.log("new user created");
    db.serialize(function() {
      db.run("INSERT INTO Users (email, password) VALUES (?, ?)", email, password, function(err) {
        if (err) {
          console.error("inserting went wrong");
          return console.error(err.message);
        }
      });
      db.get('SELECT id, email FROM Users Where email = ? AND password = ?', email, password, function(err, row) {
        if (err) {
          console.log(err.message);
          return done(err);
        }
        if (!row) {
          console.log("Something went wrong, you just put this in the database you should be able to retrieve this, this is not the case.");
          return done(null, false);
        }
        console.log(row);
        return done(null, row);
      });
    });
  });
}));
