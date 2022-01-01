const mailer = require("nodemailer");
const pug = require("pug");
const htmlToText=require("html-to-text");

class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName= user.name.spit(' ')[0];
        this.url=url;
        this.from = "Natours Project <natours@protect.io>";
    }
    _createTransporter() {
        if (process.env.NODE_ENV==="development"){
            return  mailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "a53a8c059efe3c",
                  pass: "755ee2e8f25bf9"
                }
            });        
        } else {
            return 1
        }
    }

    async send(template, subject) {
        //Render l'HTML pour l'email selon un pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName : this.firstName,
            url : this.url,
            subject : subject
        });
        const mailOptions = {
            from : this.from,
            to : this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        }
        await this._createTransporter().sendMail(mailOptions);
    }

    sendWelcome(){
        this.send('welcome', 'Welcome to the natours project')
    }

}

 
// const sendEmail= async function(options){
//     //Créer un transporter (service qui envoie l'email) genre gmail, yahoo
//     //pour gmail il faut activer une option pour autoriser les connexion auto et on est limités à 500 email par jour
//     const transporter = mailer.createTransport({
//         host: "smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "a53a8c059efe3c",
//           pass: "755ee2e8f25bf9"
//         }
//     });

//     //Définir les options de l'email

//     const mailOptions = {
//         from : "Natours Project ",
//         to : options.email,
//         subject : options.subject,
//         text : options.message,
//     } 

//     //Envoyer l'email

//     await transporter.sendMail(mailOptions);
// }


module.exports=Email;