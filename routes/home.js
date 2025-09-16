const express = require("express");
const router  = express.Router();
const {isLoggedIn} = require("../middleware.js");

const User = require("../models/user.js");   
const passport = require("passport");
const localStrategy = require("passport-local");
const homecontroller = require("../controllers/home.js");
const usercontroller = require("../controllers/user.js")
// Route handlers
router.get("/" , homecontroller.home);

router.get("/link"  , isLoggedIn ,  homecontroller.link);

router.get("/loby", isLoggedIn , homecontroller.loby);

router.get('/call/:meetingCode', isLoggedIn , homecontroller.call);

router.get("/register" , usercontroller.getregister);

router.get("/login" ,usercontroller.getlogin);

router.post("/register" , usercontroller.postregister);

router.post("/login", passport.authenticate('local', { failureredirect: "/login", failureFlash: true }),usercontroller.postlogin );

router.get("/logout", usercontroller.logout );

module.exports = router;