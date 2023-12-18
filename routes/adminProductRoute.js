const express=require('express')
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



const adminProductController = require('../controller/adminProductController')


const auth = require('../middleware/auth')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  
  const imageFilter = function (req, file, cb) {
    // Accept all types of image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };
  
  
  const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
  })
  

admin_route.get('/addproducts',adminProductController.addProducts)
admin_route.get('/editproducts',adminProductController.editProducts)

admin_route.get('/viewproducts',adminProductController.viewProducts)
admin_route.post('/saveproducts',upload.array('image',6),adminProductController.saveProducts)

admin_route.get('/deleteproducts',adminProductController.deleteProduct)
admin_route.post('/uploadproducts', upload.array('image', 6), adminProductController.addingProducts);




// admin_route.use(errorHandlers.notFound)
// admin_route.use(errorHandlers.errorHandler)

module.exports = admin_route