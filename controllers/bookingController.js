const { catchAsync } = require("./errorController")
const Tour = require("../models/tourModel.js");
const Booking = require("../models/bookingModel.js");

const factory = require("./controllerFactory");
const AppError = require("../utilities/AppErrors.js");
const Stripe= require("stripe");
const stripe=Stripe("sk_test_51KCnC9DxJPU7E7jENfiri4pvYO3kGfBxetEUpJQ8NtTWYiNj6h8ihYFxE7BZHhL3rgIi58VDhAdxnMrHX2b6bNyG00mSPawN7w")

const getCheckoutSession = catchAsync( async function(request, response, next){
    const tour = await Tour.findById(request.params.tourId);
    const session= await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${request.protocol}://${request.get('host')}/?tour=${request.params.tourId}&user=${request.user.id}&price=${tour.price}`,
        cancel_url : `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
        customer_email : request.user.email,
        client_reference_id : request.params.tourId,
        line_items : [
            {
                name : `${tour.name} tour`,
                description : tour.summary,
                images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount : tour.price*100, //multiplié parce que stripe attends le prix en cents
                currency : 'usd',
                quantity : 1
            }
        ]
    })

    response.status(200).json({
        status: 'success',
        session
    })

})

const createBookingCheckout =catchAsync (async (request, response, next) => {
    const {tour, user, price} = request.query;

    if (!tour && !user && !price) return next();

    const booking = await Booking.create({tour, user, price});

    response.redirect(request.originalUrl.split('?')[0]);
})


const createBooking = factory.createOne(Booking);

const deleteBooking = factory.deleteOne(Booking);

const updateBooking = factory.updateOne(Booking);

const getOneBooking = factory.getOne(Booking);

const getAllBookings = factory.getAll(Booking);


module.exports= {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    deleteBooking,
    updateBooking,
    getOneBooking,
    getAllBookings
}