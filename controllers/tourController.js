const Tour = require("../models/tourModel.js");
const AppError = require("../utilities/AppErrors.js");
const {catchAsync}=require("./errorController");
const factory = require("./controllerFactory");
const multer = require("multer");
const sharp=require("sharp");

const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, cb) => {
    if(file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new AppError("Invalid file type ! Please try again", 400), false)
    }
    
};

const upload= multer({
    storage : multerStorage,
    fileFilter : multerFilter
})



const aliasTopTours = function(request, responses, next){
    request.query.limit=5;
    request.query.sort="-ratingsAverage,price";
    request.query.fields="name,price,ratingsAverage,summary";

    next();
}


const getTourStats = catchAsync(async function(request, response,next) {

    const stats= await Tour.aggregate([
        {
            $match : { ratingAverage : {$gte : 4.5} }
        },
        {
            $group : { 
                _id : {$toUpper : "$difficulty"}, //GROUP BY.
                numberOfTours : { $sum : 1}, //Pour chaque document qui passe dans la pipeline, 1 est ajouté. équivalent de count(row)
                numberOfRatings : {$sum : "$ratingQuantity"},
                averageRating: { $avg : "$ratingAverage"},
                averagePrice : { $avg : "$price"},
                minimumPrice : { $min : "$price"},
                maximumPrice : { $max : "$price"}
            }
        },
        {
            $sort : 
            {
                averagePrice : 1 // 1 pour ASC
            }
        }
    

    ]);
    response.status(200).json({
        status : "success",
        data : {
            stats
        }
     });

});

const getMonthlyPlan = catchAsync(async function(request, response, next) {

    /*
    Tout les Tours qui se déroulent durant l'année indiquée.
    Chaque tour peut avoir lieu plusieurs fois par un an, donc en le return une fois pour chaque date dans l'année
    Et ENSUITE on groupBy selon chaque mois et après on output le nombre de Tours qui ont lieu durant chaque mois.
    */

    const year= request.params.year * 1 ;

    const plan= await Tour.aggregate([
        {
            $unwind :  "$startDates"
        },
        {
            $match : {
                startDates : {
                    $gte : new Date(`${year}-01-01`),
                    $lte : new Date(`${year}-12-31`)} 
            }
        },
        {
            $group : {
                _id : { $month : "$startDates"},
                NumberOfTours : {$sum : 1}, //équivalent de count(row)
                tours : {$push: "$name"} //Pour chaque document, on push lee nom dans un array appelée tours
            }
        },
        {
            $addFields : {
                month : "$_id"
            }
        },
        {
            $project : {
                _id : 0 //n'affiche pas l'id.
            }
        },
        {
            $sort : {
                month : 1
            }
        },
        {
            $limit : 12
        }
    ])

    response.status(200).json({
        status : "success",
        data : {
            plan
        }
    });

})


const getTourWithin = catchAsync (async function(request, response, next){
    const {distance, latlng, unit} = request.params;
    if (!distance || !latlng) {
        return next(new AppError("An insuficient amount of informations were provided"), 400);
    }
    const [lat, lng] = latlng.split(",");

    if(!lat || !lng) {
        return next(new AppError("Please provide the coordinates in a valid format (lat, lng)", 400));
    }

    //Converstion en radian en prenant en compte l'unité
    const radius = unit ==="mi" ? distance / 3963.2 : distance / 6378.1 
    
    const tours = await Tour.find(
        { startLocation : 
            { $geoWithin : {
                $centerSphere : [[lng , lat], radius]
    
       } } })

    response.status(200).json({
        status : "success",
        results : tours.length,
        data : {
            tours
        }
    })

})

const getAllTours= factory.getAll(Tour);

const getTour= factory.getOne(Tour, {path : "reviews"});

const createTour = factory.createOne(Tour);

const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);


const uploadTourImages = upload.fields([
    {name : 'imageCover', maxCount : 1},
    {name : 'images', maxCount : 3}]) 

const resizeTourImages = catchAsync( async (request, response, next) => {

    if(!request.files.imageCover ||!request.files.images) return next();

    request.body.imageCover= `tour-${request.params.id}-${Date.now()}-cover.jpeg`
    //On resize d'abord la cover image
    await sharp(request.files.imageCover.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality : 90})
        .toFile(`public/img/tours/${request.body.imageCover}`)

    request.body.images=[];
    //On a besoin de map et d'await all sinon ça passerait à next avant 
    //Parce que ça await juste dans le callback
    await promise.all(
        request.files.images.map(async (file,i) => {
            let fileName = `tour-${request.params.id}-${Date.now()}-${i+1}.jpeg`
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({ quality : 90})
                .toFile(`public/img/tours/${fileName}`)
            request.body.images.push(fileName);
        })
    );

    //Dans une loop on resize toute les autres images

    
    next();
});

module.exports={
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getTourWithin,
    uploadTourImages,
    resizeTourImages
}