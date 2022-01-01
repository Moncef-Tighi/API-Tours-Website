const mongoose = require("mongoose");
const {isEmail} = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
 
let userSchema = new mongoose.Schema({

    name : {
        type : String,
        require : [true, "A user must have a name"]
    },

    email : {
        type : String,
        require : [true, "A user must have an email adress"],
        unique : true,
        lowercase : true, 
        validate : [isEmail, "Please provide a valid email adress"]
    },

    photo : {
        type : String,
        default : "default.jpg"
    },

    password : {
        type : String,
        require : [true, "A user must have a password"],
        minlength : 8,
        select: false
    },

    role : {
        type : String,
        enum : ["admin", "user", "guide" , "lead-guide"],
        require : [true, "A user must have a valid role"]
    },

    passwordConfirm : {
        type : String,
        require : true,
        validate : {
            // Ne fonctionne que sur SAVE
            validator : function(element){
                return (this.password===element);
            },
            message : "The two passwords don't match"
        }
    },

    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpire : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }

})


//Normalement faut utiliser une instance method qui s'appliquer à toute les instances.
//Mais pour une raison inconnu ça ne marchait pas, donc je l'ai appliqué directement sur l'instance
// userSchema.methods.correctPassword= async function(candidatePassword, userPassword){
//     return await bcrypt.compare(candidatePassword, userPassword);
// }


const passwordCrypt = async function(next){
    //On crypte que si le mot de passe a été changé

    if (!this.isModified("password") || !this.isNew){
        return next()
    }
    this.password= await bcrypt.hash(this.password,12);
    this.passwordChangedAt=Date.now()-1000; //Le moins -1000 évite un bug ou la date est créé un peu avant que le hash du mdp ne soit créé.
    this.passwordConfirm = undefined;

    next();
}
//Crypté le mot de passe
userSchema.pre("save", passwordCrypt);

userSchema.pre(/^find/, function(next){

    this.find({active : {$ne : false} });
    next();
})


const User = mongoose.model("user", userSchema);

User.correctPassword= async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

User.changedPasswordAfter = async function(passwordChangedAt, jwtTimeCreation) {
    //Peut être que le fait que j'utilise this esst un problème parce que c'est pas une méthode du schéma, mais de son instance(model).
    if (passwordChangedAt){
        //On met la date de changement de mot de passe au même format que la date de création do token
        const timeStamp = parseInt(passwordChangedAt.getTime()/1000, 10);
        return timeStamp>jwtTimeCreation;
    }
    return false;
}

User.createPasswordResetToken = function(user){
    //Créé un string random dans update. Puis le crypte avec sha256 pour pouvoir le stocker dans la DB de manière sécurisée.
    const resetToken = crypto.randomBytes(32).toString("hex")

    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");;
    //Expire dans 600 secondes
    user.passwordResetExpire = Date.now()+ 600;
    return resetToken;
}

module.exports= User;