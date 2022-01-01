const Review = require("../models/reviewModel.js");
const {catchAsync}=require("./errorController");
const AppError = require("../utilities/AppErrors.js");
const factory = require("./controllerFactory");


// const createReview = catchAsync (async function(request, response, next){

//     const newReview=await Review.create({
//         review : request.body.review,
//         rating : request.body.rating,
//         reviewedTour : request.body.tour,
//         createdBy : request.body.user
//     });
    
//     response.status(201).json({
//         status : "success",
//         data : {
//             newReview
//         }
//     })

// });

const setTourUserId = function(request,response,next){
        //Si on a pas spécifié de tour dans la requête, ça veut dire qu'il est dans le lien
    //Parce qu'on a utilisé une nested route. Mais c'est toujours possible de la spécifier explicitement
    if (!request.body.tour) request.body.tour = request.params.id
    //User nous vient du protect middelware, logique vu que c'est con de spécifier qui a créé la review
    //Alors que le gars qui créé la review est connecté.
    if (!request.body.user) request.body.user = request.user.id;

    next();
}     

const SetParamId = function(request,response, next){
    /*Middeleware qui a pour objectif d'ajouter le filter dans la request
    Dans le cas où on veut lister tout les review d'un tour spécifique. */
    let filter;
    if (request.params.id) filter = {tour : request.params.id}

    request.filter=filter;   
    next();
}
const listReviews = factory.getAll(Review);

const getReview = factory.getOne(Review);

const createReview = factory.createOne(Review);

const updateReview = factory.updateOne(Review);

const deleteReview = factory.deleteOne(Review);

module.exports={
    listReviews,
    setTourUserId,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    SetParamId
}