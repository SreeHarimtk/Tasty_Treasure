const mongoose=require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/tasty_treasure_database")

const express=require('express')
const app=express()

const bodyparser=require('body-parser')
const path=require('path')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



//for user routes
const userRoute=require('./routes/userRoute')


const user=require('./controller/userController')

// userRoute.set('view engine','ejs')
// userRoute.set('views','./views/users')
// userRoute.set

app.use('/',userRoute)

app.listen(3001,()=>{
    console.log('server started')
})