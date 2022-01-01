const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : ["A review can't be empety"]
    },
    rating : {
        type : Number,
        require : [true, "A review must have a rating"],
        min : [1, "A rating can't be lower than 1"],
        max : [5, "A rating can't be higher than 5"]
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        select : false
    },
    
    reviewedTour : [{
        type : mongoose.Schema.ObjectId,
        ref : "tour",
        require : [true, "A review must belong to a tour."]
    }],
    createdBy : [{
        type : mongoose.Schema.ObjectId,
        ref : "user",
        require : [true, "A review must be written by a user."]
    }]
},{

    toJSON : {virtuals : true},
    toObject : {virtuals : true} 

});

reviewSchema.index({tour : 1, user : 1}, {unique : true});

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path : "reviewedTour",
    //     select : "name"
    // });
    this.populate({
        path : "createdBy",
        select : "name photo"
    });

    next();

});


// reviewSchema.statics.calculateAverageRatings = async function(tourId){
//     const stats= await this.aggregate([
//         {
//             $match: {tourId}
//         },
//         {
//             $group: {
//                 _id: "$tour",
//                 nRatings : {$sum : 1},
//                 avgRating : {$avg : "$rating"}
//             }
//         }
//     ])
// }
// reviewSchema.pre("save", function(next){
    
//     this.constructor.calculateAverageRatings(this.reviewedTour);
//     next();
// })

const Review = mongoose.model("review", reviewSchema);


module.exports=Review;