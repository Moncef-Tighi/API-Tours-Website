const express = require("express");
const {getAllTours,getTour,createTour,updateTour,deleteTour,aliasTopTours,
     getTourStats,getMonthlyPlan, getTourWithin, uploadTourImages,resizeTourImages
    } = require("../controllers/tourController.js")
const {protect, restrict} = require("../controllers/authenticationController");
const reviewRouter = require("./reviewRoute");

const router = express.Router();


router.route("/monthly-plan/:year").get(protect, restrict("admin", "lead-guide", "guide"),getMonthlyPlan);
router.route("/top-5-cheapest").get(aliasTopTours,getAllTours);
router.route("/stats").get(getTourStats);
router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getTourWithin);


router.route("/")
    .get(getAllTours)
    .post(protect, restrict("admin", "lead-guide" ),createTour);
router.route("/:id")
    .get(getTour)
    .patch(protect, restrict("admin", "lead-guide"),uploadTourImages,resizeTourImages,updateTour)
    .delete(protect, restrict("admin", "lead-guide"), deleteTour);

//Nested Routes
router.use("/:id/reviews", reviewRouter);


module.exports=router;