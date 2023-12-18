const express=require('express')

const user_route=express()

user_route.set('view engine','ejs')
user_route.set('views','view')

// const errorHandlers = require('../middleware/errorHandlers')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const session = require('express-session')

const config = require('../config/config')

user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}))

const auth = require('../middleware/auth')

const orderController = require('../controller/userOrderController')




user_route.post('/saveOrder',orderController.saveOrder)
user_route.get('/orderplaced',orderController.orderPlaced)
user_route.get('/cancelorder',orderController.cancelOrder)
user_route.post('/verifyRazorpayPayment',orderController.verifyRazorpayPayment)
user_route.get('/userordertable',orderController.userOrderTable)
user_route.get('/vieworder',orderController.userViewOrderDetails)




// user_route.use(errorHandlers.notFound)
// user_route.use(errorHandlers.errorHandler)


module.exports = user_route