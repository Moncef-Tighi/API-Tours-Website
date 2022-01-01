console.log("oui");

const stripe= Stripe("pk_test_51KCnC9DxJPU7E7jES82JnQAPPqtRXYCjzRKsTZwR3PnnslrRuBax9hZmnwtbfwPKkV7KGx9oUWMsfqCX2JKxBynd00NDdq1lF7")

const bookTour = async tourId => {
    try {
        const session= await axios({
            url:`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        });    

        await stripe.redirectToCheckout({sessionId : session.data.session.id});

    } catch(error){
        console.log(error);
    }
    
}

const button = document.getElementById("book-tour");

button.addEventListener("click", event=>{
    event.target.textContent= "Processing...";
    const {tourId}=event.target.dataset;
    bookTour(tourId);

});