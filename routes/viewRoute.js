const express= require("express");
const {getOverview, getTour, getLogin, getAccount, updateUserData,getMyTours} = require("../controllers/viewsController");
const {isLoggedIn, logout, protect} = require("../controllers/authenticationController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/",bookingController.createBookingCheckout,isLoggedIn, getOverview);

router.get("/tour/:tour", isLoggedIn,getTour);

router.get("/me", protect, getAccount)
router.get("/my-tours", protect, getMyTours)

router.get("/login", isLoggedIn ,getLogin);

router.post("/submit-user-data", protect, updateUserData)




module.exports=router;