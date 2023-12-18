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

const userPasswordController = require('../controller/userPasswordController')





user_route.get('/resetpassword',userPasswordController.resetPassword)
user_route.post('/changepassword',userPasswordController.changePassword)
user_route.post('/saveNewPassword',userPasswordController.saveNewPassword)
user_route.post('/forgetPasswordVerify',userPasswordController.forgetPasswordVerify)
user_route.get('/forget',userPasswordController.forget)
user_route.post('/forget',userPasswordController.forgetPasswordChange)




// user_route.use(errorHandlers.notFound)
// user_route.use(errorHandlers.errorHandler)

module.exports = user_route