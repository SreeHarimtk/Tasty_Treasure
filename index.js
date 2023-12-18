const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/tasty_treasure')






const express=require('express')
const session = require('express-session')
const {notFound} = require('./middleware/errorHandlers')
const app=express()

app.set('view engine','ejs')
app.set('views','view')


const path=require('path')
app.use(session({
    secret:'thisismynew',
    resave:true,
    saveUninitialized:false
}))
app.use('/css',express.static(path.resolve(__dirname,'public')))
app.use('/assets',express.static(path.resolve(__dirname,'public/assets')))
app.use('/uploads',express.static(path.resolve(__dirname, 'public/uploads')))

const userRoute=require('./routes/userRoute')
const userOrderRoute = require('./routes/userOrderRoute')
const userPasswordRoute = require('./routes/userPasswordRoute')
const userCartRoute = require('./routes/userCartRoute')
const adminProductRoute= require('./routes/adminProductRoute')
const userAdressroute = require('./routes/userAdressRoute')


const admin_route = require('./routes/adminRoute')



app.use('/',userRoute)

app.use('/',userOrderRoute)
app.use('/',userPasswordRoute)
app.use('/',userCartRoute)
app.use('/',adminProductRoute)
app.use('/',userAdressroute)
app.use('/',admin_route)


app.use(notFound)
// app.use(errorHandler)

app.listen(3000,()=>{
    console.log('server started')
})

