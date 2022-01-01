const {catchAsync} = require("./errorController");
const AppError = require("../utilities/AppErrors");
const APIFeatures = require("../utilities/APIFeatures");

const createOne = (Model) => catchAsync(async function(request, response, next) {
    const document = await Model.create(request.body);
        response.status(201).json({
            status: "success",
            data : {
                document
            }
        });

});

const deleteOne = (Model) => catchAsync(async function(request, response,next){
    const document = await Model.findByIdAndDelete(request.params.id);
    if (!document) {
        return next(new AppError("no document found with that id", 404))
    };

    response.status(200).json({       
        status : "success",
        data : null
    })

}) 

const updateOne = (Model) => catchAsync( async function(request, response, next) {
    
    const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
        new: true, // Obligatoire pour que le nouveau document soit return, et non pas l'ancien
        runValidators : true
    });
            
    if (!document) {
        return next(new AppError("no document found with that id", 404))
    };

    response.status(200).json({
        status : "success",
        data : {
            document
        }
    })
    
});


const getOne = (Model,populateOptions) => catchAsync(async function(request, response, next){
    /*
        getOne prend en paramètre des options de populate dans le cas où le model
        utilise des populate.
    */
    
    let querry=  Model.findById(request.params.id);

    if (populateOptions) querry= querry.populate(populateOptions);
    
    const document = await querry;

        
    if (!document) {
        return next(new AppError("no document found with that id", 404))
    };

    response.status(200).json({
        status : "success",
        data : {
            document
        }
    });

})

const getAll = (Model) =>  catchAsync(async function(request,response, next){
    /*
        On est obligés d'await la querry plus tard pour qu'on puisse implémenter des features comme page ou sort
        Qui doivent être implémenter sur l'objet querry avant de l'envoyer pour avoir le résultat
    */
   
        //On passe request.filter pour le cas ou on utilise une nested route.
        //Du coup, dans ce cas là on remplit request.filter dans un middelware et on passe au next
        //Sinon, il est juste undefined
    const features= new APIFeatures(Model.find(request.filter), request.query)
        .filter()
        .sort()
        .projection()
        .paginate();
        
    const document = await features.query;

    response.status(200).json({
        status : "success",
        results: document.length,
        data : document
    })    

});

module.exports= {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
}