const mongoose = require("mongoose");
const slugify = require("slugify");


let schema = new mongoose.Schema({

    name : {
        type : String,
        require: [true, "A tour must have a name"],
        unique : true,
        trim : true,
        minlength: [10, "A tour must have at least a 10 character name"],
        maxlength: [40, "A tour must have more than 40 character name"]
    },
    duration : {
        type: Number,
        require : [true, "A tour must have a duration"]
    },
    maxGroupSize : {
        type: Number,
        require : [true, "A tour must have a group size"]
    },
    difficulty : {
        type: String,
        require : [true, "A tour should have a difficulty"],
        enum : {
            values : ["easy", "medium", "difficult"],
            message : "Difficulty is either easy, medium or difficult"
        }
    },
    ratingsAverage : {
        type: Number,
        default : 4.5,
        min : [1, "A rating can't be lower than 1"],
        max : [5, "A rating can't be higher than 5"]
    },
    ratingsQuantity : {  
        type: Number,
        default : 0
    },
    price : {
        type : Number,
        required : [true, "A tour must have a price"]
    },

    discountPrice : {
        type : Number,
        validate: {
            validator : function(){
                return value<this.price
            },
            message: "Discount price should be below regular price"

        }
    },

    summary : {
        type : String,
        trim : true,
        require : [true, "A tour must have a description"]
    },
    description: {
        type : String,
        trim : true
    },
    imageCover : {
        type : String,
        require :  [true, "a tour must have a cover image"]
    },

    images :  [String],

    createdAt : {
        type : Date,
        default : Date.now(),
        select : false
    },

    startDates : [Date],
    slug: String,
    secretTour : Boolean,

    startLocation : {
        type : {
            type : String,
            default : "Point",
            enum : ["Point"]
        },
        coordinates : [Number],
        address : String,
        description : String
    },

    locations : [
    {
        type : {
            type : String,
            default : "Point",
            enum : ["Point"]
        },
        coordinates : [Number],
        address : String,
        description : String,
        day : Number
    }],

    guides : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }]

},{

    toJSON : {virtuals : true},
    toObject : {virtuals : true} 

});

//schema.index({price : 1});
schema.index({price : 1, ratingAverage : 1});
schema.index({slug: 1});
schema.index({startLocation : "2dsphere"});


//DOCUMENT MIDDELWARE

schema.virtual("durationWeeks").get(function(){
    return this.duration / 7;
});

//Virtual populate
schema.virtual("reviews", {
    ref:"review",
    foreignField : "reviewedTour",
    localField : "_id"
})

schema.pre("save", function(next){
    this.slug= slugify(this.name, {lower: true});
    next();
});

schema.pre( /^find/ , function(next){
    this.find({secretTour : {$ne : true}});
    this.start= Date.now();
    next();
});

schema.pre(/^find/, function(next){
    this.populate({
        path : "guides",
        select : "-__v -passwordChangedAt"
    });
    next();
})

//Embedding guides.
// schema.pre("save", function(next){
//     const guidesPromises = this.guides.map(async id=> await User.findById(id));
//     this.guides=await promise.all(guidesPromises);
//     next();
// })





schema.post( /^find/, function(documents, next){
    console.log(`The querry took : ${Date.now()-this.start} MS`);
    next();
});

schema.post("aggregate", function(next){
    this.pipeline.unshift({ match : { secretTour : {$ne : true } } });
    next();
})

const Tour = mongoose.model("tour", schema);


module.exports= Tour;