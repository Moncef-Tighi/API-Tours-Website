const User = require("../models/userModel.js");
const AppError = require("../utilities/AppErrors.js");
const {catchAsync}=require("./errorController");
const factory = require("./controllerFactory");
const multer = require("multer");
const sharp=require("sharp");

// const multerStorage =multer.diskStorage({
//     destination : (request, file, cb) => {
//         cb(null, 'public/img/users')
//     }, 
//     filename : (request, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${request.user.id}-${Date.now()}.${extension}`); 
//     }
// })

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



const filterRequest = function(request, ...fields){
    const result = {};
    Object.keys(request).forEach(element=> {
        if (fields.includes(element)) result[element] = request[element];
    })
    return result
}

const updateMe = catchAsync(async function(request, response, next){
    //C'est une fonction pour que l'user puisse update ses propres informations
    if (request.body.password){
        return next(new AppError("Warning, you can't update your password informations with this route"), 400);
    }
    //on a besoin de filtrer la requête pour éviter par exemple que quelqu'un change son rôle de user à admin
    const filteredBody = filterRequest(request.body, "name", "email");
    if (request.file) filteredBody.photo = request.file.filename;

    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
        new : true,
        runValidators : true
    });
    response.status(200).json({
        status : "success",
        updatedUser
    })

});

const deleteMe = catchAsync(async function(request, response, next){
    /*Ce n'est pas vraiment un delete, ça ne fait qu'update l'attribut active à false.
    Et après on utilise un middelware pour dissimuler les user inactif et les empêcher de se connecter.
    Mais on a quand même besoin de leur info parce que ça serait bizarre d'avoir une review
    appartenant à un user supprimé qu'on ne connait plus.*/

    const user = request.user;
    user.active=false;

    await user.save();


    response.status(204).json({
        status : "success",
        data : null
    })
});

const whoAmI = (request, response, next) => {
    //Middelware qui vient avec getOne. 
    //getOne utilise le paramètre, alors que l'id de l'user dans ce cas vient vient du fait qu'il est connecté.
    //Donc on le passe ici avant de l'envoyer à GetOne.
    request.paramas.id=request.user.id
    next();
}

const createUser = factory.createOne(User);

const getAllUsers = factory.getAll(User);

const getUser = factory.getOne(User);

const updateUser = factory.updateOne(User)

const trueDelete = factory.deleteOne(User);
 
const uploadUserPhoto= upload.single("photo")

const resizeUserPhoto = catchAsync( async (request, response, next) => {

    if(!request.file) return next();

    request.file.filename= `user-${request.user.id}-${Date.now()}.jpeg`
    //Une image en RAM est stocké dans le buffer.
    await sharp(request.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality : 90})
        .toFile(`public/img/users/${request.file.filename}`)
    
    next();
})


module.exports={
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    updateMe,
    deleteMe,
    trueDelete,
    whoAmI,
    uploadUserPhoto,
    resizeUserPhoto
}