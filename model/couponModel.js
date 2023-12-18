const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    expireDate: {
        type: String,
        require: true
    },
    minprice: {
        type: Number,
        require: true
    }
  
})

const coupon = mongoose.model('coupon', couponSchema)
module.exports = coupon