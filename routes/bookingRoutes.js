const express = require("express");
const { protect, restrict} = require("../controllers/authenticationController");
const booking=require("../controllers/bookingController");

const router= express.Router();

router.use(protect)
    router.get('/checkout-session/:tourId', protect, booking.getCheckoutSession);
    router.use(restrict("admin", 'lead-guide'))
        router.route('/').get(booking.getAllBookings).post(booking.createBooking)
        router.route('/:id').get(booking.getOneBooking).patch(booking.updateBooking).delete(booking.deleteBooking);

module.exports=router;