const express =require('express')
const multer = require('multer')
// const path = require('path')



const admin_route=express()
const path = require('path')

admin_route.set('view engine','ejs')
admin_route.set('views','view')


// const errorHandlers = require('../middleware/errorHandlers')


const adminauth = require('../middleware/adminAuth')

const bodyParser = require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

const session = require('express-session')

const config = require('../config/config')

admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}))

admin_route.use(express.static('public'))






const auth = require('../middleware/auth')

const adminController=require('../controller/adminController')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/banner');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });







admin_route.get('/adminlogin',adminController.adminLogin)
admin_route.post('/adminlogin',adminController.adminHome)
admin_route.get('/adminhome',adminController.adminHomee)

admin_route.get('/adminlogout',adminController.adminLogout)

admin_route.get('/adminUserDetails',adminController.adminUserDetails)





admin_route.get('/blockuser',adminController.blockUser)



admin_route.get('/search',adminController.searchUsers)
admin_route.get('/searchproducts',adminController.searchProducts)

admin_route.get('/adminvieworder',adminController.adminViewOrderDetails)
admin_route.post('/updateOrderStatus',adminController.updateOrderStatus)

admin_route.post('/savecategory',adminController.saveCategory)
admin_route.get('/getChartData',adminController.chartData)
admin_route.get('/getLastWeekChart',adminController.lastWeekChart)
admin_route.get('/getproductchart',adminController.productChart)

admin_route.get('/reports',adminController.reports)
admin_route.get('/fetchreports',adminController.fetchReports)
admin_route.get('/customDateReports',adminController.customDateReports)

admin_route.post('/savecoupon',adminController.saveCoupon)
admin_route.get('/checkCoupon',adminController.validatingCoupon)

admin_route.post('/updateOfferPrice',adminController.updateOfferPrice)
admin_route.get('/banner',adminController.banners)
admin_route.post('/uploadBanner', upload.array('images'), adminController.uploadBanner);



// admin_route.use(errorHandlers.notFound)
// admin_route.use(errorHandlers.errorHandler)



module.exports=admin_route