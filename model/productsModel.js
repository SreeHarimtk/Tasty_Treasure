const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    subcat: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    ratings: [{ type: Number }],
    reviews: [
        {
            username: {
                type: String,
            },
            review: {
                type: String,
            },
            rating: {
                type: Number
            }
        },
    ],
    
    averageRating: {
        type: Number,
        default: 0,
    },
  
        softDelete: {
            type: Number,
            default: 0, 
        },
    });
;

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
