const mongoose=require("mongoose");
const SubSection = require("./SubSection");

const tagsSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        trim:true,
    },

    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },


});

module.exports=mongoose.model("Tags",tagsSchema);