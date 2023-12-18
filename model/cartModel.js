const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({

    userId :{
        type : mongoose.Types.ObjectId,
        ref : 'User'
    },

   product : [{
  
    productId : {
        type : mongoose.Types.ObjectId,
        ref : 'Products'
    },
    
    price : {
        type : Number,
        required : true
    },

    quantity : {
        type : Number,
        required : true
    },
   
   
}],
   
   totalPrice : {

    type : Number,
    default : 0

   }


})


const cart = mongoose.model('cart',cartSchema)
module.exports = cart
