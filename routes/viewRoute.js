const express= require("express");
const {getOverview, getTour, getLogin, getAccount, updateUserData,getMyTours} = require("../controllers/viewsController");
const {isLoggedIn, logout, protect} = require("../controllers/authenticationController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();
//On a besoin de booking controller ici mais c'est temporaire, la solution n'est PAS sécurisé.
//C'est juste qu'il faut un vrai site web pour créer une solution sécuriser avec Stripe
router.get("/",bookingController.createBookingCheckout,isLoggedIn, getOverview);

router.get("/tour/:tour", isLoggedIn,getTour);

router.get("/me", protect, getAccount)
router.get("/my-tours", protect, getMyTours)

router.get("/login", isLoggedIn ,getLogin);

router.post("/submit-user-data", protect, updateUserData)




module.exports=router;