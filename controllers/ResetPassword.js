const User=require("../models/User");
const mailSender=require("../utils/mailSender")
const bcrypt=require("bcrypt");

// resetpasswordToken <-- mail sennd krne ka kaam ye hi kr rhe hai ye samjho jo link jaayega email pr

exports.resetPasswordToken=async(req,res)=>{
   try {
     //get email from req ki body

    const email=req.body.email;

    //check user fpr this eamil , email Validation
const user=await User.findOne({email:email});

if(!user) {
    return res.json({
        success:false,
        message:"Your email is not Registered with us"
    });
}
    //generate token 
const token=crypto.randomUUID();
    // update user by adding token and expiration time

    const updateDetails=await User.findOneAndUpdate(
        {email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000,
        },
        {
            new:true // new ko true krne se new Documet aata hai updated  
        }
    
    )

    // create url

    const url=`http://localhost:3000/update-password/${token}`

    // send mail containing the url 
await mailSender(email,
    "Password Reset Link",
    `Password Reset Link: ${url}`
);
    // return response
    return res.json({
        success:true,
        message:"Email sent Successfully, Please check email and change password"
    })

   } catch (error) {
    console.log(error);
    res.status(500).json({
        success:false,
        message:"Something went wrong while sending  reset Password email"
    })
   }
    
}

// reset Password  --> jo exact db mai update ka kaam hai 

exports.resetPassword=async(req,res)=>{
    try {
        // data fetch
        const{password,confirmPassword,token}=req.body;
        //validation
        if(password!=confirmPassword) {
            return res.json({
                success:false,
                message:"Password not matching",
            })
        }
        //get userDetails from db using token
        const userDetails=await User.findOne({token:token})
        //if no entry invalid token
         if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid'
            })
         }
        // token ka time bhi check kr lo khin expire toh nhi ho gya hai 
        if(userDetails.resetPasswordExpires<Date.now()) {
            return res.json({
                success:false,
                message:"Token is expired, Please regenerate your token"
            });
        }
        // ab password ko hash karna hai
        const hashedPassword=bcrypt.hash(password,10);
        // ab iske baad password ko update karna hai
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )
        // return response

        return res.status(200).json({
            success:true,
            message:"Password Reset Successfully"
        })
        
    } catch (error) {
     console.log(error);
    res.status(500).json({
        success:false,
        message:"Something went wrong while sending  reset Password email"
    })   
    }
}