const mongoose = require("mongoose");


const { Schema } = mongoose;
const userDetailSchema = new Schema(
  {
    gender:{type:String},
    walletAddress:{type:String},
    email: {type: String,unique:true},
    firstname:{type:String},
    lastname:{type:String},
    username:{type:String},
    phoneNumber: {type: Number,maxlength: 12},
    status: {type:Number,default:0},
    ipAddress: {type: String},
    device_info: {type: String},
    location: {type: String},
    referral_id: {type: String},
    isActive:{type:Boolean,default:true}
  },
  { timestamps: true }
);
const UserDetail = mongoose.model("userDetails", userDetailSchema);
module.exports = UserDetail;
