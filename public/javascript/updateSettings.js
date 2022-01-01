const formUpdate = document.querySelector(".form-user-data");
const formPassword = document.querySelector(".form-user-settings");

const updateSettings= async (data, type)=>{
    const url = type==="password" ? "http://127.0.0.1:3000/api/v1/users/updatePassword" : "http://127.0.0.1:3000/api/v1/users/updateMe"
    try {
        const response = await axios({
            method : "PATCH",
            url ,
            data
        })   
        if (response.data.status="success") return location.reload(); 
        
    } catch(error) {
        console.log(error.response.data.message);
    }
}

if (formUpdate) {
    formUpdate.addEventListener("submit", (event)=>{
        event.preventDefault();
        const form = new FormData(); 
        form.append('name', document.getElementById("name").value)
        form.append('email',document.getElementById("email").value)
        form.append('photo', document.getElementById("photo").files[0])
        updateSettings(form, "email")
    })
}

if (formPassword) {
    formPassword.addEventListener("submit", async (event)=> {
        event.preventDefault();
        const passwordCurrent= document.getElementById("password-current").value;
        const password= document.getElementById("password").value;
        const passwordConfirm= document.getElementById("password-confirm").value;
        await updateSettings({password, passwordCurrent, passwordConfirm}, "password");
        document.getElementById("password-current").value=""
        document.getElementById("password").value=""
        document.getElementById("password-confirm").value=""
    })
}