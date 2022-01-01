const Tour= require("../models/tourModel");
const Booking= require("../models/bookingModel");

const AppError = require("../utilities/AppErrors");
const {catchAsync}=require("./errorController");

const getOverview = catchAsync (async (request, response, next) => {

    const tours = await Tour.find();    
    response.status(200).render("overview", {
        title : "All tours",
        tours
    });
})

const getTour = catchAsync (async (request, response, next) => {

    const slug = request.params.tour;

    const tour = await Tour.findOne({slug : slug}).populate({
        path : "reviews",
        fields : "review rating user"
    });

    if (!tour) {
        return next(new AppError("There is no tour with that name." , 404))
    }

    response.status(200).render("tour", {
        title : `${tour.name} Tour`,
        tour
    });
})

const getLogin = function(request, response ,next){
    response.status(200).render("login", {
        title : `Login page`
    });

}

const getAccount= (request, response) => {
    response.status(200).render("account", {
        title : `Your account`,
        user : response.locals.user
    }); 
}

const updateUserData = catchAsync( async function(request, response, next) {
    const updateUser = await User.findByIdAndUpdate(request.user.id, {
        name : request.body.name,
        email : request.body.email
    }, {
        new : true,
        runValidators : true
    });
    if (updateUser){
        return response.status(200).render("account", {
            title: "Your account",
            user : updateUser
        })
    }
    next(new AppError("invalid logins", 402));
})

const getMyTours = catchAsync (async (request,response,next) => {

    const bookings = await Booking.find({user: request.user.id});
    const tourIds = bookings.map(element=> element.tour[0].id);
    const tours = await Tour.find({_id : {$in : tourIds}});

    response.status(200).render("overview", {
        title : "My bookings",
        tours
    })
})

module.exports= {
    getOverview,
    getTour,
    getLogin,
    getAccount,
    updateUserData,
    getMyTours
}