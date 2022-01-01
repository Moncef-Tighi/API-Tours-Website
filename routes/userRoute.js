const express = require("express");
const {getAllUsers,getUser,updateUser,trueDelete, updateMe, deleteMe, whoAmI, createUser,uploadUserPhoto, resizeUserPhoto} = require("../controllers/userController.js")
const {signup,login, forgotPassword, resetPassword, updatePassword, protect, restrict, logout} = require("../controllers/authenticationController");


const router= express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

//À partir de maintenant, tout les routes ne sont accessible que si on est conneectés.
//Donc, on ajoute protect en tant que middelware
router.use(protect);

router.get("/whoAmI", whoAmI, getUser);
router.patch("/updatePassword", updatePassword);
//UpdateMe : L'user peut mettre à jour ses propres informations. L'admin peut update les infos de tout le monde
//ON NE CHANGE PAS le mot de passe avec updateMe.
router.patch("/updateMe", uploadUserPhoto,resizeUserPhoto,updateMe);
//DeleteMe = désactive l'user. TrueDelete n'est accessible que pour l'admin et utilise une autre route
router.delete("/deleteMe", deleteMe);


//À partir de maintenant l'accès est restraint aux admin 
router.use(restrict("admin"));
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id")
    .get(getUser)
    .patch(updateUser)
    .delete( trueDelete);


module.exports=router;