const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour= require("../../models/tourModel.js");
const User= require("../../models/userModel.js");
const Review= require("../../models/reviewModel.js");

//this Script is completly independant from the rest of the server
const db= "mongodb+srv://Moon:fairytail123@cluster0.snfpx.mongodb.net/natours?retryWrites=true&w=majority";
//const db= process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSEWORD);

mongoose.connect(db, {useNewUrlParser : true})
    .then(()=>console.log("Connected successfully to the DataBase"));


//const tours = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

//Import data into database

const importData= async ()=> {
    try {
        await Tour.create(tours);
        console.log("Data successefully loaded");
        process.exit();
    } catch(error) {
        console.log(error);
    }
}

//Delete all Data from DataBase

const deleteData= async ()=> {
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted");
        process.exit();
    } catch(error) {
        console.log(error);
    }
}

//Adding commands : 
if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}