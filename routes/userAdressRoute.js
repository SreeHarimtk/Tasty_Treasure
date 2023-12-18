
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
const userAdressController = require('../controller/userAdressController')





user_route.get('/addadress',userAdressController.addAdress)
user_route.post('/addadress',userAdressController.insertAdress)
user_route.get('/editaddress',userAdressController.editAddress)
user_route.post('/editaddress',userAdressController.editedAddress)
user_route.get('/deleteaddress',userAdressController.deleteAddress)



// user_route.use(errorHandlers.notFound)
// user_route.use(errorHandlers.errorHandler)

module.exports = user_route