const mongoose = require('mongoose')


const userAdressSchema = mongoose.Schema({

    userId :{
        type : mongoose.Types.ObjectId,
        ref : 'User'
    },

    fullname : {
        type : String,
        required : true
    },


   contactnumber : {

    type : String,
    required : true

   },

   secondarynumber : {

    type : Number,
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

  street : {
    
    type : String,
    required : true
  },

  pincode : {

    type : Number,
    required : true

  },

  state : {
    type : String,
    required : true

  },

  landmark : {
    type : String,
    required : true

  },

  type : {
    
    type : String,
    

  }







})


const userAdress = mongoose.model('userAdress',userAdressSchema)

module.exports = userAdress


