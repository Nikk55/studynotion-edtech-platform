const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
require("dotenv").config();

 // send OTP

 exports.sendOTP=async(req,res)=>{
    // fetch email from req ki body
    const {email}=req.body;

   try{

     // check kro use already exist hai yaa nhi
    const checkUserPresent=User.findOne({email});

    // if User already exist themn return a Response
    if(checkUserPresent) {
        return res.status(401).json({
            success:false,
            message:"User Already Registered"
        })
    }

    // generate OTP
   // 6 length kka OTP Hona Cahhiey Simpel sa Numbers vaala 
    var otp=otpGenerator.generate(6,{
     upperCaseAlphabets:false,
     lowerCaseAlphabets:false,
     specialChars:false
    })

    console.log("OTP ", otp);

    // and OTP genra te krne ke baad Check krna hai ki OTP jo hai vo Unique hona chahiye 

    var result=OTP.findOne({otp:otp});

    // ye bahut bekaar code hai Brute foarce vaal abut aage Comaoneis  mai aap aisi Service ke Intecat kroge ki aapko baar baatr Db mai call nhi maaarni Hogi genarlly mai aisi Servbice pr kaam krna h ho ga jo hmesha mae Uniqu OTP dega

    while(result) {
        otp=otpGenerator.generate(6,{
     upperCaseAlphabets:false,
     lowerCaseAlphabets:false,
     specialChars:false
    });

    result =OTP.findOne({otp:otp});
    }

    // ab unque OTP Generate krne ke baad uski entry hmko Databede mai save krni hogi

    const otpPayload={email,otp};

    // create an Entry in Db for OTP

    const otpBody=await OTP.create(otpPayload);

    // return resoponse Successfull
    return res.status(200).json({
        success:true,
        message:'OTP Sent Successfully!',
       otp
    })


   }catch(error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        message:error.message,
       })
   }
 }



// Sign Up

exports.signUP=async (req,res)=>{
    try {
        // phle mai data fetch kroonga req kki body mai se

    const{firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}=req.body;
// validate kro
if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
    return res.status(403).json({
        success:false,
        message:"All Fields are required",
    })
}
    // phir data ko validate kroonga

    // 2 password ko match kr lo

    if(password!==confirmPassword) {
        return res.status(400).json({
      success:false,
      message:'Password and ConfirmPassword value does not match , please try again',
        })
    }



    // check user alreafdy exist or not

    const existingUser=await User.findOne({email});

    if(existingUser) {
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        })
    }


    // find Most recent OTP stored for the User
  // dhyaan rkhna Most recent
  const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);

  console.log(recentOtp);



    // validate OTp match OTP
      
    if(recentOtp.length==0) {
        // OTP not found
        return res.status(400).json({
            success:false,
            message: "OTP not found",
        })
    }else{
        if(otp!==recentOtp.otp) {
            /// invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }
    }

    // hash Password

   const hashedPassword=await bcrypt.hash(password,10);

    // entry create in DB

   const profileDetails=await Profile.create({
    gender:null,
    dateOfBirth:null,
    about:null,
    contactNumber:null,
   })

    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    // return res
  
    return res.status(200).json({
        success:true,
        message:"User is registered Successfully",
        user
    })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be registered. Please try again !"
        })
    }





}

// Login

exports.login=async(req,res)=>{
    try {
        // get data from req ki body
        const {email,password}=req.body;

        /// validate kro data ko

        if(!email || !password) {
            res.status(403).json({
                success:false,
                message:"All fields are required Please try again !",
            })
        }

        // check kro user exist krta hai yaa nhi krta

        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not Registered, Please Signup First"
            })
        }

        // match the password
        // generate jwt token , after password match
        
        if(await bcrypt.compare(password,user.password)) {

       
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            });

            user.token=token;
            user.password=undefined;

// create cookie and send response 
const options={
    expires:new Date(Date.now()+3*24*60*60*1000),
    httpOnly:true,
}
res.cookie("token",token,options).status(200).json({
    success:true,
    token,
    user,
    message:"Logged in Successfully",
})
        }else{
            res.status(401).json({
                success:false,
                message:'Password is incorrect'
            })
        }

        
        

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure , Please Try Again!"
        })
    }
}

//Change Password

exports.changePassword=async(req,res)=>{
    // get data from req Body
    //get old Password , new pasword , conform Nrew Passwopord
    // validation
    

    // update password in DB 

    // sennd mail -> DB Password

    // return response 

} 

