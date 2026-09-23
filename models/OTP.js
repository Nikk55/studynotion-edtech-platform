const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
   email:{
   type:String,
   required:true
   },
   otp:{
    type:String,
    required:true,
   },
   createAt:{
     type:Date,
     default:Date.now(),
     expires:5*60,
   }
});

// Schema ke baad Mofdel se phle OTP ka Code
// async fucntion --> to send emails

// kya kis mail ko send krna hai kya send krna hai 
async function sendVerificcationEmail(email,otp) {

    try {

        const mailResponse=await mailSender(email,"verification Email from StudyNotion" , otp);
        console.log("Email Send Successfully", mailResponse);
        
    } catch (error) {
        console.log("Error Occurred While Sending mail: ", error);
        throw error;
    }

}

// ab hmm pre-Middle ware ka code karenge ki Document save hone se phle se hmaara Code ye Run hona Chaiye
OTPSchema.pre("save",async function(next){
    // OTP send kr enge
    sendVerificcationEmail(this.email,this.otp);
    // ab hmm next Middle ware ki taraf chale jaayeneg
    next();
})

module.exports=mongoose.model("OTP",OTPSchema);