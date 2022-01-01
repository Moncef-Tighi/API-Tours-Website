const express = require("express");
const AppError= require("./utilities/AppErrors");

const tourRouter= require("./routes/tourRoute");
const userRouter= require("./routes/userRoute");
const reviewRoute = require("./routes/reviewRoute");
const viewRouter = require("./routes/viewRoute");
const bookingRouter = require("./routes/bookingRoutes");


const path = require("path");
const {defaultError} = require("./controllers/errorController");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();

app.set("view engine", "pug");
app.set("views", `${path.join(__dirname, "views")}`);

/*
    ------------- GLOBAL MiddleWare -------------------
*/

//Header security
app.use(helmet());

//Le JSON reçu est ajouté à express (dans request) C'est un body parser
app.use(express.json({
    limit : "10kb" //Limite la taille du body à 10kb
}));
app.use(express.urlencoded({
    extended : true,
    limit : "10kb"
}))
app.use(cookieParser())

//Data sanitization contre NO-SQL injection et contre cross-site-scripting attacks
app.use(mongoSanitize());
app.use(xss());

//Protège contre la pollution de paramètre
app.use(hpp({
    whitelist : ["duration", "ratingsQuantity", "ratingsAverage","maxGroupSize","difficulty","price"]
}));


//Rate limiting
const limit= rateLimit({
    max: 100,
    windowMs : 60*60*1000,
    message : "Too many request for this ip, please retry again in an hour"
})
app.use("/api", limit);


//Pour pouvoir inclure la map, je suis obligé d'autoriser explicitement mapBox dans la content policy

const CSP = 'Content-Security-Policy';
const POLICY =
  "default-src 'self' https://*.mapbox.com https://*.stripe.com/ ;" +
  "base-uri 'self';block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:8000 'self' blob: data:;" +
  "object-src 'none';" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
  "script-src-attr 'none';" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests;';

app.use((req, res, next) => {
    res.setHeader(CSP, POLICY);
    next();
});
 
//Ne fonctionne que sur le texte qu'on envoie, mais c'est toujours ça de gagné.
app.use(compression());


// ROUTAGE
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRouter)

app.use(express.static("./public"));

app.all( (request, response, next)=> {    

    const error = new AppError(`can't find the URL ${request.originalUrl} on this server`, 404);
    next(error);
    
})

app.use(defaultError);

module.exports=app;