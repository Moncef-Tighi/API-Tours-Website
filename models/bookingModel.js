const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    tour : [{
        type : mongoose.Schema.ObjectId,
        ref : "tour",
        require : [true, "A booking must be attributed to a tour."]
    }],
    user : [{
        type : mongoose.Schema.ObjectId,
        ref : "user",
        require : [true, "A booking must be made by a user"]
    }],
    price : {
        type : Number,
        require : [true, "A booking must have a price"]
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    paid: {
        type: Boolean,
        default : true
    }
},{

    toJSON : {virtuals : true},
    toObject : {virtuals : true} 

});

bookingSchema.pre(/^find/, function(next){
    this.populate("user").populate({
        path : 'tour', 
        select : 'id'
    })
    next()
})


const Booking = mongoose.model("booking", bookingSchema);

module.exports= Booking;