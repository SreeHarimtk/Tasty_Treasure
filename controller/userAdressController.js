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






const addAdress = async(req,res)=>{

    try {
        if(req.session.user_id){
            res.render('addAdress',{message:''})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }    
    } catch (error) {
        console.log(error.message)
    }
}


const insertAdress = async(req,res)=>{

       try {
            if(req.session.user_id){
                const user = await User.findOne({ userId: req.session.user_id })
                const newAdress = new usersAdress({
                    userId : req.session.user_id,
                    fullname : req.body.fullname,
                    contactnumber : req.body.mobilenumber,
                    secondarynumber : req.body.secondarynumber,
                    street : req.body.street,
                    state : req.body.state,
                    pincode : req.body.pincode,
                    district : req.body.district,
                    landmark : req.body.landmark,
                    appartmentname : req.body.appartmentname,
                    type : req.body.type
                });
                // console.log(newAdress)
                await newAdress.save()
                res.render('addAdress',{message : 'Adress added successfully !!'})
            }else{
                res.render('userLogin',{message : 'please login again'})
            }
           } catch (error) {
        console.log(error.message)
        
    }
}



const editAddress = async(req,res)=>{
    try{
        if(req.session.user_id){
            const id = req.query.id
            const userId = req.session.user_id
            const userAddress = await usersAdress.findById({_id : id})
            const userData = await User.findById({_id : userId})
            res.render('editAddress',{userAddress,userData})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
        }catch(error){
        console.log(error.message)
    }

}




const editedAddress = async(req,res)=>{

   try {
       if(req.session.user_id){
        const {fullname,type,contactnumber,secondarynumber,appartmentname,state,pincode,landmark,district,street} = req.body
        const id = req.body.id
    
        const userAdress = await usersAdress.findByIdAndUpdate({_id : id},
        {$set:{fullname : fullname,type : type,contactnumber : contactnumber,secondarynumber : secondarynumber, appartmentname : appartmentname, street : street, landmark : landmark, district : district, pincode : pincode, state : state}}  )
         res.redirect('/userprofile')
       }else{
        res.render('userLogin',{message : 'please login again'})
       }
    
    } catch (error) {
    console.log(error.message)
   }    
}



const deleteAddress = async(req,res)=>{

    try {
        if(req.session.user_id){
            const id = req.query.id
            const addressData = await usersAdress.deleteOne({_id : id})
            res.redirect('/userprofile')
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
       
    } catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    deleteAddress,
    editAddress,
    editedAddress,
    insertAdress,
    addAdress
}