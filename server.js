const mongoose = require("mongoose");
const app = require("./app.js");
const dotenv = require("dotenv");
dotenv.config({path:__dirname+'/config.env'});

const db= process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSEWORD)
mongoose.connect(db, {
    useNewUrlParser : true
}).then(()=> console.log("Connected successfully to the DataBase"));


app.listen(process.env.PORT, ()=> {
    console.log(`server is running on ${process.env.PORT} `);
})