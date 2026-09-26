
const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User")

//auth

exports.auth=async(req,res,next)=>{
    try {
        // extract token
        // ye teen tarahj se token milega and dhyaan rlkhna ki Bearer mai se hi token lena chahiye ye shi hai 
        const token=req.cookies.token ||
                    req.body.token ||
                    req.header("Authorization").replace("Bearer ","");


        // if token missing hai oth themn retuiurn Response
        if(!token) {
            res.status(401).json({
                success:false,
                message:"Token is missing",
            })
        } 
        
        // ab token verify karenge secret key ke base pr
        try {
            const decode= jwt.verify(token,process.env.JWT_SECRET);
           console.log(decode);
           req.user=decode;
        } catch (error) {
            // verification - issue
            res.status(401).json({
                success:false,
                message:"Token is invalid",
            })
        }

        next();
    } catch (error) {
         console.log(error);
         return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
         })
    }
}

// isStudent
exports.isStudent=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Student") {
         return res.status(401).json({
            success:false,
            message:"This is a protected Route for Student only",
         })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be Verified , Please try again!"
        })
    }
}



// isInstructor

exports.isInstructor=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Instructor") {
         return res.status(401).json({
            success:false,
            message:"This is a protected Route for Instructor only",
         })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be Verified , Please try again!"
        })
    }
}


// isAdmin

exports.isAdmin=async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Admin") {
         return res.status(401).json({
            success:false,
            message:"This is a protected Route for Admin only",
         })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be Verified , Please try again!"
        })
    }
}
