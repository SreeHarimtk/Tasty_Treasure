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




const addToCart = async (req, res) => {
    try {
        if(req.session.user_id){

            const userId = req.session.user_id;
            const productId = req.query.id;
            console.log(userId);
    
            const user = await User.findById(userId);
            const product = await products.findById(productId);
            console.log(product._id);
    
            const userCart = await cart.findOne({ userId });
    
            if (userCart) {
              
                const existingProduct = userCart.product.find((item) => item.productId.equals(productId));
    
                if (existingProduct) {
                    existingProduct.quantity += 1;
                   
                } else {
                    
                    userCart.product.push({
                        productId: productId,
                        quantity: 1,
                        price: product.price,
                    
                    });
                }
    
                await userCart.save();
            } else {
               
                const newCart = new cart({
                    userId: userId,
                    product: [
                        {
                            productId: product._id,
                            quantity: 1,
                            price: product.price,
                            category : product.category
                        
                        },
                    ],
                });
                await newCart.save();
     
            }
       
            res.redirect('/userhome');
           
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
   
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





const viewCart=async(req,res)=>{
    try {
        if(req.session.user_id){
            const userId = req.session.user_id;
            const userCart = await cart.findOne({ userId: userId }).populate({
                path: 'product.productId',
                select: ['name', 'image','category','_id'], 
            });
           console.log('cart',userCart)
            if (!userCart) {
                return res.render('userViewCart', { userCart: null });
            }
           res.render('userViewCart', { userCart});
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
    
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
    


const updateQuantity = async(req,res)=>{

    try {
        if(req.session.user_id){
            const userId = req.session.user_id
            const productId = req.query.productId;
            const action = req.query.action;

            const userCart = await cart.findOne({ userId });

            if (userCart) {
              const productToUpdate = userCart.product.find(item => item.productId.equals(productId));
      
              if (productToUpdate) {
                if (action === 'inc') {
                  productToUpdate.quantity += 1;
                } else if (action === 'dec' && productToUpdate.quantity > 1) {
                  productToUpdate.quantity -= 1;
                }
    
                await userCart.save();
                return res.json({ success: true, quantity: productToUpdate.quantity, message: 'Quantity updated successfully.' });
              }
            }
            res.status(404).json({ success: false, message: 'Product not found in the cart.' });
          } else {
            res.status(401).json({ success: false, message: 'User not authenticated.' });
          }

            
        }catch (error) {
        console.log(error.message)
    }
}



const deleteFromCart = async(req,res)=>{
    try {
        if(req.session.user_id){
            const userId = req.session.user_id
            const proId = req.query.productId
            console.log(proId)
            const result = await cart.updateOne(
                { userId: userId },
                { $pull: { product: { productId: proId } } }
              );
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
    } catch (error) {
        console.log(error.message)
    }
}



const checkOut = async(req,res)=>{
    try {
     
        if(req.session.user_id){
            const userId = req.session.user_id
            const price = req.query.totalPrice
            const adress = await usersAdress.find({userId : userId})
            // console.log(userId,price,adress)
           res.render('userAdress',{price,adress})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
   } catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    addToCart,
    deleteFromCart,
    updateQuantity,
    checkOut,
    viewCart
}


