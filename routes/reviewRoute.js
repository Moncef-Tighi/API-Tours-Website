const express = require("express");
const {listReviews,createReview, deleteReview,updateReview, setTourUserId, getReview, SetParamId} = require("../controllers/reviewController");
const { protect, restrict} = require("../controllers/authenticationController");

const router= express.Router({
    mergeParams : true
});
// Le POST est une nested route.

router.use(protect);
router.route("/")
    .get(SetParamId,listReviews)
    .post(restrict("user", "admin"),setTourUserId,  createReview)

router.route("/:id")
    .get(getReview)
    .delete(restrict("admin", "user"),deleteReview)
    .patch(restrict("admin","user"),updateReview);

module.exports=router;