const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    userID:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    product:[{
        productID:{
            type:mongoose.Types.ObjectId,
            ref:'Products'
        },
      
        quantity:{
            type:Number,
            required:true
        },
        priceAtPurchase:{
            type:'Number',
            required:true
        }
    }],
    address:[{
      
        fullname :{
            type : String,
            required : true
        },
        contactnumber : {
            type : String,
            required : true
        },
        appartmentname : {
            type : String,
            required : true
        },
        district : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        street : {
            type : String
        },
        pincode : {
            type : String,
            required : true
        },
        landmark : {
            type : String,
            required : true
        }
        }],

    status:{
        type:String,
        default:'Order Placed'  
    },
    totalPrice:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    },
    paymentMethod:{
        type:String
    }
    
})
module.exports = mongoose.model('Order',orderSchema);
