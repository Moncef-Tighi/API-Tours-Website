const form = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout")  

const login = async (email, password) => {

    try {
        const response = await axios({
            method : "POST",
            url : "http://127.0.0.1:3000/api/v1/users/login",
            data : {
                email,
                password
            }
        })    
        if (response.data.status ==="success"){
            window.setTimeout( ()=> {
                location.assign("/");
            },100)
        }
        
    } catch(error) {
        console.log(error.response.data);
    }
    
}

if (form){
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password= document.getElementById("password").value;
        login(email, password)
    })
    
}

const logout = async () => {
    try {
        const request = await axios({
            method : "get",
            url : "http://127.0.0.1:3000/api/v1/users/logout"
        }) 
        if (request.data.status = "success") location.reload();

    } catch(error){
        console.log("error logging out ! Please try again")
    }
}


if (logOutBtn) {
    logOutBtn.addEventListener("click", logout)
}