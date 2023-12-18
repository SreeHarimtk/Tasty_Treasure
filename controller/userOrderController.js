


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




const orderPlaced = async(req,res)=>{

    try {
        if(req.session.user_id){
      
            res.render('orderPlaced')
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
   
}







const saveOrder = async (req, res) => {
    try {
        console.log('save order called')
        if (req.session.user_id) {

            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZORPAY_ID,
                key_secret: process.env.RAZORPAY_KEY,
            });
           
            console.log('save order called');
            const userId = req.session.user_id;
            console.log(userId);
            const adressAndDetails = req.body.payload;
            const productDetails = req.body.storedOrderData;
            console.log('productdetails',productDetails);
            console.log(adressAndDetails);
            const orderedProductIds = productDetails.products.map((product) => product.id);

            let paymentMethod; // Declare paymentMethod outside the if condition
            const user = await User.findById(userId);

            const newOrder = new order({
                userID: userId,
                product: productDetails.products.map((product) => ({
                    productID: product.id,
                    quantity: product.quantity,
                    priceAtPurchase: product.price

                })),
                address: {
                    fullname: adressAndDetails.address.fullname,
                    contactnumber: adressAndDetails.address.contactnumber,
                    appartmentname: adressAndDetails.address.appartmentname,
                    district: adressAndDetails.address.district,
                    street: adressAndDetails.address.street,
                    state: adressAndDetails.address.state,
                    pincode: adressAndDetails.address.pincode,
                    landmark: adressAndDetails.address.landmark,
                },
                paymentMethod: adressAndDetails.paymentMethod,
                totalPrice: productDetails.totalPrice,
            });

            if (adressAndDetails.paymentMethod === 'UPI') {
                const amount = parseInt(productDetails.totalPrice) * 100;
                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: 'razorUser@gmail.com'
                };
                console.log(options);

                const orderPromise = new Promise((resolve, reject) => {
                    razorpayInstance.orders.create(options, (err, order) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(order);
                        }
                    });
                });

                const order = await orderPromise;
                console.log('id',process.env.RAZORPAY_ID)
                res.status(200).send({
                    method: 'UPI',
                    success: true,
                    amount: amount,
                    key_id: process.env.RAZORPAY_ID,
                    contact: "8075180897",
                    name: req.session.user,
                    order: order // You may want to send the order details to the frontend
                });

            }else if (adressAndDetails.paymentMethod === 'wallet') {
                const amountToDeduct = parseInt(productDetails.totalPrice);
                console.log('wallet called', amountToDeduct,  user.wallet.balance )
                if (user.wallet.balance >= amountToDeduct) {
                  user.wallet.balance -= amountToDeduct;

                    await user.save();
                    const savedOrder = await newOrder.save();

                    await cart.updateMany(
                        { userId: userId },
                        {
                            $pull: {
                                product: {
                                    productId: { $in: orderedProductIds },
                                },
                            },
                        }
                    );

                    res.status(200).json({
                        message: 'Order placed successfully using wallet',
                        method: 'wallet',
                        orderId: savedOrder._id,
                    });
                } else {
               
                    res.status(400).json({ message: 'Insufficient balance in the wallet' });
                }
            } else {
                paymentMethod = adressAndDetails.paymentMethod
                console.log('here called')
                const savedOrder = await newOrder.save();
                await cart.updateMany(
                    { userId: userId },
                    {
                        $pull: {
                            product: {
                                productId: { $in: orderedProductIds },
                            },
                        },
                    }
                );

                res.status(200).json({ message: 'Order saved successfully',method : "COD", orderId: savedOrder._id, paymentMethod: paymentMethod });
            }

        } else {
            res.render('userLogin', { message: 'please login again' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Something went wrong");
    }
};










const verifyRazorpayPayment = async(req,res)=>{

    try {
        const userId = req.session.user_id;
        const adressAndDetails = req.body.payload;
        const productDetails = req.body.storedOrderData;
        // const { razorpay_payment_id } = req.body.payment;

        console.log('neewId',req.body)
        const orderedProductIds = productDetails.products.map((product) => product.id);

        let paymentMethod; // Declare paymentMethod outside the if condition

        const newOrder = new order({
            userID: userId,
            product: productDetails.products.map((product) => ({
                productID: product.id,
                quantity: product.quantity,
                priceAtPurchase: product.price
            })),
            address: {
                fullname: adressAndDetails.address.fullname,
                contactnumber: adressAndDetails.address.contactnumber,
                appartmentname: adressAndDetails.address.appartmentname,
                district: adressAndDetails.address.district,
                street: adressAndDetails.address.street,
                state: adressAndDetails.address.state,
                pincode: adressAndDetails.address.pincode,
                landmark: adressAndDetails.address.landmark,
            },
            paymentMethod: adressAndDetails.paymentMethod,
            totalPrice: productDetails.totalPrice,
        });
        paymentMethod = adressAndDetails.paymentMethod; 
        const savedOrder = await newOrder.save();
        await cart.updateMany(
            { userId: userId },
            {
                $pull: {
                    product: {
                        productId: { $in: orderedProductIds },
                    },
                },
            }
        );

        res.status(200).json({ message: 'Order saved successfully',method : "COD", orderId: savedOrder._id, paymentMethod: paymentMethod });
    

} catch (error) {
    console.log(error.message)
}}




const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;

        const updatedOrder = await order.findByIdAndUpdate(
            orderId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const userId = updatedOrder.userID;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const refundedAmount = updatedOrder.totalPrice;

        // Update user wallet balance
        user.wallet.balance += refundedAmount;

        // Save transaction details to user's wallet array
        const transactionDetails = {
            type: 'refund',
            amount: refundedAmount,
            time: new Date()
        };

        user.wallet.transaction.push(transactionDetails);

        // Save the updated user information
        await user.save();

        res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



  
const userViewOrderDetails = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id;
            const orderId = req.query.id;
            const userData = await User.findById({ _id: userId });
            const orderDetail = await order.findById(orderId);

            console.log('detail', orderDetail);

            const productDetails = await Promise.all(
                orderDetail.product.map(async (product) => {
                    const productDetail = await products.findById(product.productID);
                    return productDetail;
                })
            );
            console.log('orderdetails',orderDetail)
            console.log('details', productDetails);
            res.render('userViewOrderDetails', { userData, orderDetail, productDetails });
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
    } catch (error) {
        console.log(error.message);
    }
};




const userOrderTable = async(req,res)=>{
   
   try {
        if(req.session.user_id){
            const userId = req.session.user_id
            const userData = await User.findOne({_id : userId})
            const orderData = await order.find({userID : userId})
            console.log('neworderdata',orderData)
            res.render('userOrderTable',{orderData,userData,message :''})
        }else{
            res.render('userLogin',{message : 'please login again'})
        } 
        } catch (error) {
            console.log(error.message)
        }
    }



module.exports ={
    verifyRazorpayPayment,
    saveOrder,
    cancelOrder,
    orderPlaced,
    userOrderTable,
    userViewOrderDetails
}