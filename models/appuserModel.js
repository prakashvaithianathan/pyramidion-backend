const mongoose = require("mongoose");


const { Schema } = mongoose;
const appUserSchema = new Schema(
  {
    signup_type: {type: String,required: [true, 'Please Provide a signup type'],enum: { values: [1, 2] }},
    email: {type: String,trim: true,lowercase: true,unique: true},
    password: {type: String,trim: true,minlength: 8,required: [true, 'Please Provide a Password - Min. 8 Chars']},
    userDetail:{ type : mongoose.Schema.Types.ObjectId, ref: 'userDetails' }
  },
  { timestamps: true }
);
const AppUser = mongoose.model("AppUsers", appUserSchema);
module.exports = AppUser;
