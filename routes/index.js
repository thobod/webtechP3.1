var express = require('express');
var router = express.Router();
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
        //var product = new Product(1, "hoofd", 69.69, "poep", "coerp2");
        //var productList = { product };
        productList.push(product);
      },
      // when query is complete
      function complete(err, found) {
        // send information to the view
        res.render('index', { title: 'Shopping cart', products: productList });
        //console.log(productList);
      });
  });
  db.close();
});

// GET user sign up page
router.get('/user/signup', function(req, res, next) {
  var _user = new User("mattijs.leon@gmail.com", "password");
  res.render('user/signup', {user: _user});
});

router.post('/user/signup', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
