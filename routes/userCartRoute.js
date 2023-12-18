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

const userCartController = require('../controller/userCartController')


user_route.get('/addtocart',userCartController.addToCart)
user_route.get('/viewcart',userCartController.viewCart)
user_route.post('/updatequantity',userCartController.updateQuantity)
user_route.get('/deletefromcart',userCartController.deleteFromCart)

user_route.get('/checkout',userCartController.checkOut)




// user_route.use(errorHandlers.notFound)
// user_route.use(errorHandlers.errorHandler)



module.exports = user_route