import mongoose from "mongoose";
const refreshSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    }
}, { timestamps: true } );
export const RefreshToken = mongoose.model("RefreshToken", refreshSchema);