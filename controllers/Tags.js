const Tag=require("../models/Tags");

// Create tag ka Handler Function

exports.createTag=async(req,res)=>{
    try {
        //  Fetch data 
     const {name,description}=req.body;

     // validation
     if(!name || !description) {
        return res.status(400).json({
            success:false,
            message:"All Fields are required"
        })
     }

     // Create Entry in DB

     const tagDetails=await Tag.create({
        name:name,
        description:description,
     });

     console.log(tagDetails);
     // Response Return

     return res.status(200).json({
        success:true,
        message:"Tag Created Successfully"
     })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get All Tags Handler Function

exports.showAllTags=async(req,res)=>{
    try {
        const allTags=await Tag.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All Tags are Created Successfully!",
            allTags,
        })
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}