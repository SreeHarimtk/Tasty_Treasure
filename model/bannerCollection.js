const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({

    image:{
        type:Array,
        required:true
    }

})


const banner = mongoose.model('banner',bannerSchema)
module.exports = banner