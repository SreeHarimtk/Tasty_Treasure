const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

    first_name:{
        type:String,
        required:true
    },
    second_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    wallet: {
        balance:{
            type:Number,
            default:0
        },
        transaction :[
            {
                type: {type: String},
                amount: {type: Number},
                time: {type: Date, default: Date.now()}
            }
        ]
    }
    


})

const user=mongoose.model('User',userSchema)
module.exports = user



