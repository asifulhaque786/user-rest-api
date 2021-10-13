const sgmail = require("@sendgrid/mail");
const sendGridApiKey =
  process.env.SEND_GRID_KEY
sgmail.setApiKey(sendGridApiKey);
const sendwelcomeEmail=async(email,name)=>{
await sgmail.send({
  to: email,
  from: "asifulhaque9801@gmail.com",
  subject: "you are hired",
  text:`Hi ${name} i hope you got this`
});
}
const sendendEmail=async(email,name)=>{
    await sgmail.send({
      to: email,
      from: "asifulhaque9801@gmail.com",
      subject: "Sorry",
      text:`Hi ${name} i hope you are satisfied`
    });
    }
module.exports={
    sendwelcomeEmail,sendendEmail
}