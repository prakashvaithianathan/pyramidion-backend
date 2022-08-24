const Utils = require("../helpers/utils");
const APIRes = require("../helpers/result");
const { signAccessToken,signToken,signRefreshToken,verifyRefreshToken,verifyPassword,authenticateToken,} = require("../middleware/auth");
const AppUser = require("../models/appuserModel");
const joi = require("joi");
const { validationResult } = require("express-validator");
const UserDetail = require('../models/userDetailModel')






// This function in used to create/register new user
exports.createAppUser = async (req, res, next) => {
  try {
    let errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errors.array();
  } 
  const userInput = Utils.getReqValues(req);
  if (!userInput.signup_type) {
      return APIRes.getErrorResult("required signup type", res);
   }
  
  switch (parseInt(userInput.signup_type)) {
      case 1:
        try {
          if (!userInput.email) {
            return APIRes.getErrorResult("required email", res);
          }
          if (!userInput.password) {
            return APIRes.getErrorResult("required password", res);
          }
          const findData = await AppUser.findOne({email:userInput.email});

          if(findData){
              return  APIRes.getErrorResult("Already Email Registered", res);
          }
         
            const saveData = {};
            saveData.email = userInput.email;
            saveData.password = await Utils.password(userInput.password);
            saveData.signup_type = 1;
            const appUser = await AppUser.create(saveData);
            const userDetail = await UserDetail.create({email:saveData.email})
            const updateUserDetail = await AppUser.findByIdAndUpdate({_id:appUser._id},{userDetail:userDetail._id},{new:true,upsert:true}).select('signup_type email email_verify').populate('userDetail');
            // const result =await AppUser.findOne({email:appUser.email}).select('signup_type email email_verify');
            updateUserDetail.msg ="User Registered Successfully!"
            return APIRes.getSuccessResult(updateUserDetail,res) 
        
        } catch (error) {
          console.log(error);
          return APIRes.getErrorResult(error, res);
        }

      default:
      return APIRes.getErrorResult("bad request", res);
  
  }
  } catch (error) {
    return APIRes.getErrorResult(error, res);
  }
}

// This function is used to login the user
exports.loginUser = async (req, res, next) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    } 
    const userInput = Utils.getReqValues(req);
    if (!userInput.signup_type) {
        return APIRes.getErrorResult("required signup type", res);
     }

     if (!userInput.email) {
      return APIRes.getErrorResult("required email", res);
    }
    if (!userInput.password) {
      return APIRes.getErrorResult("required password", res);
    }

     const userId = await AppUser.findOne({email:userInput.email}).populate('userDetail')
     if(!userId){
      return APIRes.getErrorResult("User not Found", res);
     }
     if(!userId.userDetail.isActive){
      return APIRes.getErrorResult("This User was deleted by Admin", res);
     }

    const correctPassword =  await Utils.comparePassword(userInput.password,userId.password)

    if(!correctPassword){
      return APIRes.getErrorResult("Wrong Password", res);
    }

     const accessToken = await signAccessToken(userId.id, "User");
     const refreshToken = await signRefreshToken(userId.id, "User");
    //  console.log(accessToken,refreshToken);
     let result={};
     result.result =await AppUser.findById({_id:userId.id}).select('email email_verify mobile mobile_verify').populate('userDetail');
     result.msg ="login successfully!";
     result.accessToken=accessToken;
     result.refreshToken=refreshToken;
     return APIRes.getSuccessResult(result,res)


  
  } catch (error) {
    return APIRes.getErrorResult(error, res);
  }

   
 
}

//This function is used to get user information
exports.getUser = async(req,res,next)=>{
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    } 

    // console.log(req.user);

    const getUser = await AppUser.findById(req.user?.userId).select("-_id -password -signup_type -email_verify -is_logged -emailVerificationCode -status  -referral_id").populate('userDetail')

    if(!getUser.userDetail.isActive){
      return APIRes.getErrorResult("User not Found", res);
     }
    
    return APIRes.getSuccessResult(getUser,res)
    
  } catch (error) {
    return APIRes.getErrorResult(error, res);
  }
}

//This function is used to edit user details
exports.editUser = async(req,res,next)=>{
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    } 


    const userInput = Utils.getReqValues(req);
    const result = await AppUser.findById(req.user?.userId).populate('userDetail')

    if(!result.userDetail.isActive){
      return APIRes.getErrorResult("User not Found", res);
    }

    let userInput1= result;
    let whereCodn = {};
    let updateCodn ={};
    let arrayCodn = {};
    if (result?._id) {
      whereCodn._id = result?.userDetail?._id;
    }
    delete userInput1._id;

 if(userInput.walletAddress){
  updateCodn.walletAddress= userInput.walletAddress
 }

 if(userInput.gender){
  updateCodn.gender = userInput.gender
 }

 if(userInput.phoneNumber){
  updateCodn.phoneNumber = userInput.phoneNumber
 }

 if(userInput.isActive){
  updateCodn.isActive = userInput.isActive
 }

 let updateQuery = {
  $set:updateCodn,
  $addToSet:arrayCodn
 }

 console.log(whereCodn,"where");

    const updateUser = await UserDetail.findByIdAndUpdate(whereCodn,updateQuery,{new:true,upsert:true})

    

    const getUser = await AppUser.findOne({userDetail:updateUser._id}).populate('userDetail')

    
    return APIRes.getSuccessResult(getUser,res)
    
  } catch (error) {
    return APIRes.getErrorResult(error, res);
  }
}


//This function is used to softdelete an user
exports.deleteUser = async(req,res,next)=>{
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    } 

    // console.log(req.user);

    const userInput = Utils.getReqValues(req);
    const result = await AppUser.findById(req.user?.userId)

    let userInput1= result;
    let whereCodn = {};
    if (result?._id) {
      whereCodn._id = result?.userDetail;
    }
    delete userInput1._id;

    


    const updateUser = await UserDetail.findByIdAndUpdate(whereCodn,{isActive:false},{new:true,upsert:true})

    


    
    return APIRes.getSuccessResult("User Deleted Successfully",res)
    
  } catch (error) {
    return APIRes.getErrorResult(error, res);
  }
}


