const User=require('../model/userModel')
const user_route = require('../routes/userRoute')
const products = require('../model/productsModel')
const cart = require('../model/cartModel')
const usersAdress = require('../model/userAdress')
const bcrypt = require('bcrypt')
const request = require('request')
const order = require('../model/orderModel')
const userAdress = require('../model/userAdress')
require('dotenv').config();

const Razorpay = require('razorpay')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });



let otp =''



const forget = async (req,res)=>{
    try{

        res.render('forget')

    }catch(message){
        console.log(error.message)
    }
}





const resetPassword = async(req,res)=>{

    try {
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await User.findById({_id : userId})
            res.render('resetPassword',{userData,message : ''})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}



const changePassword = async(req,res)=>{
    if(req.session.user_id){
        try {
            const {currentpassword,newpassword,confirmpassword} = req.body
            console.log(currentpassword, newpassword, confirmpassword)
            const userId = req.session.user_id
            const userData =  await User.findById({_id : userId})

           
            const isPasswordValid = await bcrypt.compare(currentpassword, userData.password);

       if (isPasswordValid && newpassword === confirmpassword) {
   
       const hashedPassword = await bcrypt.hash(newpassword, 10);
       userData.password = hashedPassword;
        await userData.save();
        return res.render('resetPassword', { message: 'Password Changed Successfully', userData });   
        } else {
        return res.render('resetPassword', { message: 'Password does not match', userData });
        }


        } catch (error) {
            console.log(error.message)
        }
    }else{
        res.render('userLogin',{message : 'please login again'})
    }
}




const forgetPasswordChange = async(req,res)=>{

    try {

        const email = req.body.email
        console.log('forget called',email)

        const userData = await User.findOne({email : email})
        req.session.userData = userData
        res.render('forgetPasswordOtpPage',{message: ''})
        // console.log(req.session)
        
        if (userData) {
            const chars = [2, 3, 4, 1, 5, 6, 7, 8, 9, 0];
            let otp = ''; // Initialize the OTP variable
            const message = `your otp is `;
            for (let i = 0; i < 4; i++) {
                otp += chars[Math.floor(Math.random() * chars.length)];
            }

            const otpExpiration = new Date();
            otpExpiration.setMinutes(otpExpiration.getMinutes() + 3);
            req.session.otpExpiration = otpExpiration;

            const fullMessage = `${message}${otp}`;

            req.session.otp = otp
            req.session.save()
            console.log('tp',req.session)
            // Now, send the email with the OTP
            sendMail(fullMessage, userData.email);
            
           

          
        
    }} catch (error) {
        console.log(error.message)
    }
}


const forgetPasswordVerify = async(req,res)=>{
    try{
        console.log('2called',req.session)
        const otp = req.session.otp;
        const userData = req.session.userData
        const userId = req.session.userData._id;
  
        const otpExpiration = req.session.otpExpiration;
  
        if (new Date() > new Date(otpExpiration)) {
          return res.render('otpVerification', { message: 'OTP expired or invalid...' });
      }
      
        if (otp === req.body.otp) {
          res.render('changeForgetPassword',{userData,message : ''})
        } else {
          res.render('otpVerification',{message : 'Incorrect OTP'});
        }

    }catch(error){
        console.log(error.message)
    }
}


const saveNewPassword = async(req,res)=>{
    try {
        const id = req.session.userData._id
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword
        const userData = req.session.userData

        if(password != confirmpassword){
            res.render('changeForgetPassword',{userData,message : 'Password doesnot match'})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatedUser = await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } })
        if (!updatedUser) {
            return res.render('changeForgetPassword', { message: 'User not found or invalid token.' })
          }
           res.render('userLogin', { message: 'Password changed successfully.' });
    } catch (error) {
        console.log(error.message)
    }
}






module.exports = {
    saveNewPassword,
    forgetPasswordChange,
    forgetPasswordVerify,
    changePassword,
    resetPassword,
    forget
}