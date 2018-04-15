var express = require('express');
var router = express.Router();
var passport = require('passport');
// database handling
var fs = require("fs");
var file = "products.db";
var exists = fs.existsSync(file);
if(!exists) {
  fs.openSync(file, "w");
}
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

//create ES6 class for Products
var Product = class {
  constructor(id, name, price, category, manufacturer) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.manufacturer = manufacturer;
    this.imgSrc = "../images/" + name.toLowerCase() + ".png";
  }
}

//create ES6 class for users
var User = class {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var productList = [];
  db.serialize(function() {
    // load all products
    db.each("SELECT * FROM Products",
    function item(err, row) {
      // add products to list
      var product = new Product(row.id, row.name, row.price, row.category, row.manufacturer);
      productList.push(product);
    },
    // when query is complete
    function complete(err, found) {
      // send information to the view
      res.render('index', { title: 'Shopping cart', products: productList });
      //console.log(productList);
    });
  });
});

// GET user sign up page
router.get('/user/signup', function(req, res, next) {
  res.render('user/signup');
});

router.post('/user/signup', function(req, res, next) {
  passport.authenticate('local.signup', function(err, user, info) {
    if (err) {
      console.log(err.message);
      return next(err);
    }
    if (!user) {
      console.log("no user");
      return res.redirect('/user/signup');
    }
    console.log(user);
    return res.redirect('/user/profile');
  })(req, res, next);
});

router.get('/user/profile', function(req, res, next) {
  res.render('user/profile');
});

router.get('/user/signin', function(req, res, next) {
  res.render('user/signin');
})

router.post('/user/signin', function(req, res, next) {
  passport.authenticate('local.signin', function(err, user, info) {
    if (err) {
      console.log(err.message);
      return next(err);
    }
    if (!user) {
      console.log("no user");
      return res.redirect('/user/signin');
    }
    console.log(user);
    return res.redirect('/user/profile');
  })(req, res, next);
});

router.post('/', function(req, res, next) {
  var productList = [];
  var ordering = " ORDER BY ";
  switch (req.body.orderby) {
    case "priceasc":
      ordering += "price ASC";
      break;
    case "pricedes":
      ordering += "price DESC";
      break;
    case "titleasc":
      ordering += "name ASC";
      break;
    case "titledes":
      ordering += "name DESC";
      break;
    default:
      ordering = "";
  }
  var where = " WHERE ";
  if (req.body.category) {
    where += "category ";
  }

  
  // load all products
  db.each("SELECT * FROM Products WHERE category = ?" + ordering, req.body.category,
  function item(err, row) {
    // add products to list
    var product = new Product(row.id, row.name, row.price, row.category, row.manufacturer);
    productList.push(product);
  },
  // when query is complete
  function complete(err, found) {
    // send information to the view
    res.render('index', { title: 'Shopping cart', products: productList });
    //console.log(productList);
  });
});

module.exports = router;
