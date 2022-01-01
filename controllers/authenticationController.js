const User = require("../models/userModel");
const {catchAsync}=require("./errorController");
const jwt = require("jsonwebtoken"); 
const AppError = require("../utilities/AppErrors");
const Email = require("../utilities/email");
const crypto = require("crypto");

//Permet de promesssify sans se casser la tête
const {promisify} = require("util");

const signToken = function(userId){

    return jwt.sign({id : userId}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRE_IN
    });

}

const sendToken = function(user, statusCode, response) {

    const token = signToken(user._id);

    const cookieOptions =  {
        expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),  //conversion de jour à milisecondes
        httpOnly : true
    }
    if(process.env.NODE_ENV==="production"){
        cookie.options.secure = true
    }

    response.cookie("jwt", token, cookieOptions);

    //On supprime le mot de passe pour éviter qu'il ne soit affiché dans la réponse
    user.password=undefined;

    response.status(statusCode).json({
        status : "success",
        token,
        data : {
            user
        }
    })

}

const signup = catchAsync(async function(request, response, next){

    const newUser = await User.create({
        name : request.body.name,
        email : request.body.email,
        password : request.body.password,
        passwordConfirm : request.body.passwordConfirm,
        role : request.body.role
    }); 

    sendToken(newUser, 201, response);
    const url = `${request.protocol}://${request.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    next();
});

const login = catchAsync(async function(request, response, next){
    const {email, password} = request.body;

    //1) Check si un email et mot de passe ont étés envoyés

    if (!email || !password){
        return next(new AppError("Please provide an email and password" ,400));
    }

    //2) Check si l'user existe et la combinaison email/mdp est correcte

    const user = await User.findOne({email}).select("+password");

    if (!user ||!(await User.correctPassword(password, user.password)) ){
        return next(new AppError("Invalid email or password" ,401) );
    }

    //3) Si c'est bon, envoyer le token

    sendToken(user, 200, response);

});

const protect = catchAsync(async function(request, response, next){

    let token;

    // Réccupérer le token depuis : Header > Authorization : Bearer >>token<<
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        token = request.headers.authorization.split(" ")[1];
    } else if (request.cookies.jwt){
        token = request.cookies.jwt;
    }

    // Est-ce qu'il y a un tokken ?

    if (!token){
        return next(new AppError("You need to be logged in to have access to this page" ,401) );
    }

    //Vérification du token avec JWT et réccupération de l'id de l'user qui se trouve dans la payload

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Vérifier que l'user existe toujours et qu'il n'a pas changé de mot de passe.

    const currentUser = await User.findById(decoded.id);
    if (!currentUser){
        return next(new AppError("This user dosen't exist anymore", 401));
    }

    if (!User.changedPasswordAfter(currentUser.passwordChangedAt,decoded.iat)){
        return next(new AppError("This token uses an expired password", 401));
    }

    //Maintenant qu'on a tout vérifié, on place les data de l'user dans la request au cas où on veut l'utiliser après
    //On ne demande donc pas les infos de l'user, on obtient le token et à partir du token on obtient les infos.
    request.user=currentUser;
    response.locals.user=currentUser    
    next();
})

const restrict = (...roles)=> {
    return (request, response, next) => {
        //Cette fonction utilise une closure
        //On utilise cette syntaxe bizarre parce que sinon on peut pas passer de paramètre à un middelware express.

        if (!roles.includes(request.user.role)) {
            return next(new AppError("You don't have the right to perform this operation", 403));
        }
        next();
    }
}

const forgotPassword = catchAsync( async function(request, response, next){

    //Trouver l'user selon son mot de passe.

    const user = await User.findOne({email : request.body.email});
    if (!user){
        return next (new AppError("This email belong to no one", 401));
    }

    //Générer un token random qui sera utilisé pour confirmer que l'user a bien vu l'email de reset

    const resetToken = User.createPasswordResetToken(user);

    await user.save({validateBeforeSave : false});

    const resetURL= `${request.protocol}://${request.get("host")}/api/v1/userResetPassword/${resetToken}`;

    const message = `Submit a patch request with your new password and the confirmation to this reset URL : 
    \n${resetURL} 
    \nif you didn't forget your password, please ignore this email.`;

    try {
        // await sendEmail({
        //     email : user.email,
        //     subject : "Password reset token (valid for 10 minutes)",
        //     message : message 
        // })    
    } catch {
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave : false});

        return next(new AppError("Can't send the email, try again later", 500));
    }


    response.status(200).json({
        status : "success",
        message : "The reset token have been sent to your email"
    })

})

const resetPassword = catchAsync (async function(request, response, next){

    //Trouver l'user grace au token de réinitialisation.
    //Pour le faire il faut d'abord recrypter le mot de passe

    const hashedToken =  crypto.createHash("sha256").update(request.params.token).digest("hex");

    const user = await User.findOne({ 
            passwordResetToken : hashedToken,
            passwordResetExpires: {
                $gt : Date.now()
            } 
        }
    );

    //Si l'user existe que le token n'est pas expirer, changer le mot de passe.

    if (!user){
        return next(new AppError("The token is not valid", 403))
    }
    
    user.password= request.body.password;
    user.passwordConfirm=request.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save();

    //Connecter l'user en lui envoyant un nouveau token

    sendToken(user, 200, response);

})

const updatePassword = catchAsync (async function(request, response, next){


    if (!request.body.password || !request.body.passwordConfirm){
        return next(new AppError("Please provide a valid password and password confirmation", 401));
    }
    if (await User.correctPassword(request.body.password,request.body.passwordConfirm) ){
        return next(new AppError("The two passwords don't match.", 401));
    }
    const user = request.user;
    user.password=request.body.password;
    user.passwordConfirm=request.body.passwordConfirm;

    await user.save();

    sendToken(user, 200, response);
    
})

const isLoggedIn = async function(request, response, next){

    // Réccupérer le token depuis : Header > Authorization : Bearer >>token<<
    if (request.cookies.jwt && request.cookies.jwt!="logedout"){
        try {
            const decoded = await promisify(jwt.verify)(request.cookies.jwt, process.env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);
            if (!currentUser){
                return next();
            }
            if (!User.changedPasswordAfter(currentUser.passwordChangedAt,decoded.iat)){
                return next();
            }
            response.locals.user=currentUser    
        } catch(error) {
            return next();
        }
    }
    next();
}
const logout = function(request, response, next){
    response.cookie("jwt","logedout", {
        expires : new Date(Date.now() + 10*1000),
        httpOnly : true
    });
    response.status(200).json({
        status : "success"
    })
}

module.exports = {
    signup,
    login,
    protect,
    restrict,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn,
    logout
}