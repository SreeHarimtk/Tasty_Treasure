const express=require('express')

const user_route=express()

user_route.set('view engine','ejs')
user_route.set('views','view')



const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const session = require('express-session')

const config = require('../config/config')

user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}))

const auth = require('../middleware/auth')

const userController=require('../controller/userController')
// const errorHandlers = require('../middleware/errorHandlers')

user_route.get('/',auth.isLogout,userController.loadRegister)

user_route.get('/usersignup',userController.userSignup)
user_route.post('/usersignup',userController.insertUser)

user_route.get('/userhome',userController.userHome)
user_route.get('/userlogin',auth.isLogout,userController.userLogin)
user_route.post('/userlogin',userController.verifyLogin)

user_route.get('/logout',auth.isLogin,userController.userLogout)



user_route.get('/verifyotp',userController.verifyOtp)
user_route.post('/verifyotp',userController.matchOtp)


user_route.get('/productdetails/:id',userController.productDetails)

user_route.get('/filterveg',userController.filterVeg)
user_route.get('/filternonveg',userController.filterNonVeg)
user_route.get('/filterdishes',userController.filterDishes)
user_route.get('/filtersweets',userController.filterSweets)

user_route.get('/searchproducts',userController.searchProducts)

user_route.get('/userprofile',userController.userProfile)
user_route.get('/resendOtp',userController.resendOtp)

user_route.get('/edituserprofile',userController.editProfile)
user_route.post('/edituserprofile',userController.updateUserProfile)
user_route.get('/debouncesearch',userController.debounceSearch)

user_route.get('/viewWallet',userController.userWallet)

user_route.get('/getOrderData',userController.getOrderData)

user_route.post('/addReview',userController.addReview)
user_route.get('/getReviews/:productId',userController.getReview)

user_route.get('/addReviewproduct',userController.reviewPage)

user_route.get('/addReviewButton',userController.addReviewButton)


// user_route.use(errorHandlers.notFound)
// user_route.use(errorHandlers.errorHandler)



module.exports = user_route






