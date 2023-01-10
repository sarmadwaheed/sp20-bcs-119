var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
/* GET home page. */
var checkSessionAuth = require("../middlewares/checkSessionAuth");
/* GET home page. */
router.get("/contact-us", function (req, res, next) {
  req.flash("success", "Thanks for contacting us. We will reach you in a moment. Our agent will contact you soon.");
  return res.render("site/contact");
  
});

router.get("/products", async function (req, res, next) {
  let products = await Product.find();
  let cart = req.cookies.cart;
  res.render("products/list", { title: "Products In DB", products, cart });
});
router.get("/products/add", checkSessionAuth, async function (req, res, next) {
  res.render("products/add");
});



// store data in db
router.post("/products/add", async function (req, res, next) {
  let product = new Product(req.body);
  await product.save();
  let cart = [{
    _id: 1,
    name: "Adidas",
    price: 500
  },{
    _id: 2,
    name: "Gray Nichollas",
    price:  1000
  }]
  res.render("site/cart", {products: cart});
});
router.get("/products/delete/:id", async function (req, res, next) {
  let product = await Product.findByIdAndDelete(req.params.id);
  res.redirect("/products");
});
router.get("/products/cart/:id", async function (req, res, next) {
  let product = await Product.findById(req.params.id);
  console.log("Add This Product in cart");
  let cart = [];
  if (req.cookies.cart) cart = req.cookies.cart;
  cart.push(product);
  res.cookie("cart", cart);
  res.redirect("/products");
});
router.get("/products/cart/remove/:id", async function (req, res, next) {
  let cart = [];
  if (req.cookies.cart) cart = req.cookies.cart;
  cart.splice(
    cart.findIndex((c) => c._id == req.params.id),
    1
  );
  res.cookie("cart", cart);
  res.redirect("/cart");
});
router.get("/products/edit/:id", async function (req, res, next) {
  let product = await Product.findById(req.params.id);
  res.render("products/edit", { product });
});
router.post("/products/edit/:id", async function (req, res, next) {
  let product = await Product.findById(req.params.id);
  product.name = req.body.name;
  product.price = req.body.price;
  await product.save();
  res.redirect("/products");
});

router.get("/login", function (req, res, next) {
  return res.render("site/login");
});



router.post("/login", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("danger", "User with this email not present");
    return res.redirect("/login");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (validPassword) {
    req.session.user = user;
    req.flash("success", "Congratz. You have logged in now enjoy.");
    return res.redirect("/");
  } else {
    req.flash("danger", "ohh invalid entry have you forgoten your password");
    return res.redirect("/login");
  }
});
router.get("/register", function (req, res, next) {
  return res.render("site/register");
});
router.get("/logout", async (req, res) => {
  req.session.user = null;
  console.log("session clear");
  req.flash("danger", "Ohh.You have log out now. Log in back to continue.");
  return res.redirect("/login");
});
router.post("/register", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    req.flash("danger", "You are already logged in");
    return res.redirect("/register");
  }
  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  req.flash("success", "Your account has been succesfully created.");
  return res.redirect("/");
});




router.get("/", async function (req, res, next) {
  let products = await Product.find();
  return res.render("site/homepage", {
    pagetitle: "Awesome Products",
    products,
  });
  
});





module.exports = router;
