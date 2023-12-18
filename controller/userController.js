const User=require('../model/userModel')
const user_route = require('../routes/userRoute')
const products = require('../model/productsModel')
const cart = require('../model/cartModel')
const usersAdress = require('../model/userAdress')
const bcrypt = require('bcrypt')
const request = require('request')
const order = require('../model/orderModel')
const userAdress = require('../model/userAdress')
require('dotenv').config();
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const pdf = require('html-pdf')
const Razorpay = require('razorpay')
const banner = require('../model/bannerCollection')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });



let otp =''

const securePassword = async(password)=>{
    try{

      const passwordHash = await bcrypt.hash(password,10)
      return passwordHash

    }catch(error){
        console.log(error.message)
    }
}


const loadRegister = async(req,res)=>{
    try{

       res.render('registration',{message:''})

    }catch(error){
        
        console.log(error.message)
    }
}






const userSignup = async(req,res)=>{
    try{

        res.render("userSignup",{message:''})

    }catch(error){
        console.log(error.message)
    }
}



const userLogin = async(req,res)=>{
    try{
        res.render('userLogin',{message:''})

    }catch(error){
        console.log(error.message)
    }
}



const verifyOtp = async(req,res)=>{
    try{
        console.log(req.session)
        res.render('otpVerification',{message : ''})
    }catch(error){
        console.log(error.message)
    }
}


const insertUser = async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        if (password !== confirmpassword) {
            res.render('usersignup', { message: 'Password does not match...!!' });
            console.log('password doesnt match');
            return;
        }

        const passwordRegex = /^.{5,}$/;
        const isValidPassword = passwordRegex.test(password);

        if (!isValidPassword) {
            res.render('usersignup', { message: 'Password should contain at least 5 characters...!!' });
            console.log('Password contain 5 characters');
            return;
        }

        const mobileRegex = /^[0-9]{10}$/;
        const isValidMobile = mobileRegex.test(req.body.mobile);

        if (!isValidMobile) {
            res.render('usersignup', { message: 'Invalid mobile number format...!!' });
            console.log('invalid mobile number format');
            return;
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(req.body.email);

        if (!isValidEmail) {
            res.render('usersignup', { message: 'Invalid email format...!!' });
            console.log('invalid email format');
            return;
        }



        const checkUser = await User.findOne({ email: req.body.email });
        if (checkUser) {
            res.render('usersignup', { message: 'User already exists..!!' });
            console.log('user exists');
            return;
        }

        const spassword = await securePassword(password);
        const user = new User({
            first_name: req.body.first_name,
            second_name: req.body.second_name,
            mobile: req.body.mobile,
            email: req.body.email,
            password: spassword,
            is_admin: 0,
        });
      
        const userData = await user.save();
         
           req.session.userData = userData

        if (userData) {
            const chars = [2, 3, 4, 1, 5, 6, 7, 8, 9, 0];
            let otp = ''; // Initialize the OTP variable
            const message = `your otp is `;
            for (let i = 0; i < 4; i++) {
                otp += chars[Math.floor(Math.random() * chars.length)];
            }

            const otpExpiration = new Date();
            otpExpiration.setMinutes(otpExpiration.getMinutes() + 3);
            req.session.otpExpiration = otpExpiration;

            const fullMessage = `${message}${otp}`;

            req.session.otp = otp
            // Now, send the email with the OTP
            sendMail(fullMessage, userData.email);

            console.log(userData);

            res.redirect('/verifyotp')
        
        } else {
            res.render('registration', { message: 'Your Registration was Failed...!!' });
        }
    } catch (error) {
        console.log(error.message);
    }
}




const resendOtp = async(req,res)=>{

    try{
        console.log('otpresend called')
        console.log('otp',req.session.userData.email)
        const userEmail = req.session.userData.email;
       

        const chars = [2, 3, 4, 1, 5, 6, 7, 8, 9, 0];
        let otp = '';
        for (let i = 0; i < 4; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }

        const fullMessage = `Your new OTP is ${otp}`;
        sendMail(fullMessage, userEmail);
        res.json({ success: true, message: 'OTP resent successfully.' });

    }catch(error){
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}



const matchOtp = async (req, res) => {
    try {
      const otp = req.session.otp;
      const userId = req.session.userData._id;

      const otpExpiration = req.session.otpExpiration;

      if (new Date() > new Date(otpExpiration)) {
        return res.render('otpVerification', { message: 'OTP expired or invalid...' });
    }
    
  
      if (otp === req.body.otp) {
        await User.findByIdAndUpdate(userId, { $set: { is_verified: 1 } });
        res.render('userLogin',{message :'Registered Succesfully...'});
      } else {
        res.render('otpVerification',{message : 'Incorrect OTP'});
      }
    } catch (error) {
      console.error(error);
      res.send('Error occurred');
    }
  };
  



const sendMail = (message,reciever)=>{
    try {
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        host:'smtp.gmail.com',
        port:587,
        auth: {
            user: process.env.EMAil,
            pass: process.env.MAIL_PASS,
        },
        });
        const mailOptions = {
            from:process.env.EMAil,
            to:reciever,
            subject:"Otp to login ",
            text:message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email: ', error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

module.exports = transporter;

    } catch (error) {
        
    }
}




const verifyLogin = async (req, res) => {
    console.log('fn vcalled')
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
           console.log(userData)
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_admin === 1) {
                    req.session.admin = userData._id;
                    res.json({ message: '', redirect: '/adminhome' });


                } else if (userData.is_admin === 0 && userData.is_blocked === false) {
                    req.session.user_id = userData._id;
                    res.json({ message: '', redirect: '/userhome' });


                } else if (userData.is_blocked === true) {
                    console.log('User is blocked');
                    res.json({ message: 'Access denied by Admin...!!' });
                }
            } else {
                res.json({ message: ' Incorrect Password' });
            }
        } else {
            res.json({ message: 'Email and password are incorrect' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'An error occurred' });
    }
};




const userHome = async (req, res) => {
    try {
      if (req.session.user_id) {
        
        const PAGE_SIZE = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PAGE_SIZE;
  
        const currentTime = new Date().getHours();
        const activeSubcategories = getActiveSubcategories(currentTime);

        const bannerData = await banner.find();
  
        const productData = await products
          .find()
          .skip(skip)
          .limit(PAGE_SIZE);

          console.log(productData);
          console.log('banner',bannerData)
  
        const totalProducts = await products.countDocuments();
        const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
  
        res.render('userHome', {
          products: productData.map((product) => ({
            ...product.toObject(),
            isActive: activeSubcategories.includes(product.subcat),
          })),
          currentPage: page,
          totalPages: totalPages,
          banner: bannerData.map((banner) => banner.toObject())
        });
      } else {
        res.render('userLogin', { message: 'Please login again' });
      }
    } catch (error) {
      console.error(error);
      res.render('errorPage', { error: 'An error occurred.' });
    }
  };
  
  function getActiveSubcategories(currentTime) {
    if (currentTime >= 7.00 && currentTime < 23.00) {
      return ['breakfast'];
    } else if (currentTime >= 12 && currentTime < 17) {
      return ['lunch'];
    } else if (currentTime >= 15 && currentTime < 24) {
      return ['dinner'];
    } else {
      return [];
    }
  }
  
  

  

const userLogout = async (req,res)=>{
    try{
        if(req.session.user_id){

            req.session.destroy()
            res.redirect('/')
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
     
    }catch(error){
        console.log(error.message)
    }
}





const productDetails = async (req,res)=>{

    try{
        if(req.session.user_id){
            const id = req.params.id
           
                console.log('paramsid',id)
                const productData = await products.findById(id)
                console.log('p',productData)
                if(productData){
                    res.render('productDetails',{products:productData})
                }
              
            else {
                res.render('404')
            }
          
        }else{
           
        }
      
    }catch(error){
        console.log(error.message)
    }
  
}



const filterVeg = async (req,res)=>{

    try{
        if(req.session.user_id){
            const productData = await products.find({category:"Veg"})
            res.render('veg',{products:productData})
        }else{
            
        }
       
    }catch(error){
        console.log(error.message)
    }
  
}



const filterNonVeg = async (req,res)=>{

    try{
        if(req.session.user_id){
            const productData = await products.find({category:"Non-veg"})
            res.render('nonVeg',{products:productData})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }

    }catch(error){
        console.log(error.message)
    }

}



const filterSweets = async (req,res)=>{

    try{
        if(req.session.user_id){
            const productData = await products.find({category:"Sweets"})
            res.render('sweets',{products:productData})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
    }catch(error){
        console.log(error.message)
    }
    
}


const filterDishes = async (req,res)=>{
    
    try{
        if(req.session.user_id){
            const productData = await products.find({category:"Dishes"})
            res.render('dishes',{products:productData})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
    }catch(error){
        console.log(error.message)
    }
   
}




const searchProducts = async (req, res) => {
    try {
      if (req.session.user_id) {
        const searchQuery = req.query.search;
  
        const productsFound = await products.find({
          $or: [
            { name: { $regex: new RegExp(searchQuery, 'i') } },
          ],
        });
  
        if (productsFound.length > 0) {
          res.render('userSearchProducts', { products: productsFound });
        } else {
          res.render('noItemsFound');
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  
 

  const debounceSearch = async (req, res) => {
    try {
      const searchQuery = req.query.search;
    console.log('query',searchQuery)
     
      if (searchQuery) {
      
        const product = await products.find({
          $or: [
            { name: { $regex: new RegExp(searchQuery, 'i') } },
          ],
        });
  
        res.json({ success: true, products: product });
      } else {
       
        res.json({ success: true, products: [] });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  
  
  
  




  const userProfile = async (req,res)=>{
    
    try{
       if(req.session.user_id){
       
            const userId = req.session.user_id
            const userData = await User.findById({_id : userId})
            const adress = await usersAdress.find({userId : userId})
           
            res.render('userProfile',{adress,userData})
           
       }else{
       
       }
   
    }catch(error){
        console.log(error.message)
    }
  }


















const editProfile = async(req,res)=>{
    try{
        if(req.session.user_id){
            const id = req.session.user_id
            userData = await User.findById({_id : id})
            res.render('editUserProfile',{userData,message:''})
        }

    }catch(error){
        console.log(error.message)
    }
}





const updateUserProfile = async(req,res)=>{
    try {
        if(req.session.user_id){
            const {firstname,secondname,mobile,email} = req.body
            const updatedUser = await User.findByIdAndUpdate(
                req.session.user_id,
                {
                  first_name : firstname,
                  second_name : secondname,
                  mobile : mobile,
                  email : email
                },
                { new: true } 
            );

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
             res.render('editUserprofile',{message : 'Profile Updated Succesfully !!'})

        }
    } catch (error) {
        console.log(error.message)
    }
}




const userWallet = async(req,res)=>{

    try {
        const userId = req.session.user_id
        const userData = await User.findById({_id: userId})

        res.render('userWallet',{userData})
        
    } catch (error) {
        console.log(error.message)
    }
}

const getOrderData = async (req, res) => {
  try {
      const orderId = req.query.id;
      const orderData = await order.findById({ _id: orderId });

      if (!orderData) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const address = orderData.address;
      const total = orderData.totalPrice;
      const paymentMethod = orderData.paymentMethod;

      // Generate a random 10-digit invoice number
      const invoiceNumber = Math.floor(1000000000 + Math.random() * 9000000000); // 10 digits

      const productDetails = await Promise.all(orderData.product.map(async (product) => {
          const productData = await products.findById(product.productID);
          return {
              productName: productData.name,
              quantity: product.quantity,
              price: productData.price
          };
      }));

      console.log('products', productDetails);
      console.log('address', address);
      console.log('total', total);
      console.log('paymentMethod', paymentMethod);
      console.log('invoiceNumber', invoiceNumber); // Log the generated invoice number

      const filepath = path.resolve(__dirname, '../view/orderInvoice.ejs');
      const htmlstring = fs.readFileSync(filepath).toString();

      // Pass data to the EJS template
      const ejsData = ejs.render(htmlstring, {
          productDetails,
          address,
          total,
          paymentMethod,
          invoiceNumber // Pass the generated invoice number
      });

      let options = {
          width: '100mm',  // Adjust width as needed
          height: '150mm', // Adjust height as needed
          border: '10mm'
      };

      pdf.create(ejsData, options).toFile('users.pdf', (err, result) => {
          if (err) {
              console.log(err);
              return res.status(500).json({ message: 'Error generating PDF' });
          }

          const filepath = path.resolve(__dirname, '../users.pdf');
          fs.readFile(filepath, (err, file) => {
              if (err) {
                  console.log(err);
                  return res.status(500).send('Could not download file');
              }
              res.setHeader('Content-type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename=users.pdf'); // Fix here
              res.send(file);
          });
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

  



// const getOrderData = async (req, res) => {
//     try {
//         const orderId = req.query.id;
//         const orderData = await order.findById({ _id: orderId });
        
//         if (!orderData) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         const address = orderData.address;
//         const total = orderData.totalPrice;
//         const paymentMethod = orderData.paymentMethod;

//         const productDetails = await Promise.all(orderData.product.map(async (product) => {
//             const productData = await products.findById(product.productID);
//             return {
//                 productName: productData.name,
//                 quantity: product.quantity,
//                 price: productData.price,
//             };
//         }));

   
     
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };





const addReview = async(req,res)=>{

    try {
        const id = req.session.user_id

        const userData = await User.findById(id)
        console.log('usereview',userData)
        const username = userData.first_name;

        const { productId, rating, review } = req.body;

    const product = await products.findById(productId);
    console.log('rev product',product)

    product.reviews.push({ username, review });
    product.ratings.push(parseInt(rating));

 
    const newAverageRating = product.ratings.reduce((sum, r) => sum + r, 0) / product.ratings.length;
    product.averageRating = newAverageRating;

    await product.save();

    res.redirect('/productdetails/'+productId)
        
    } catch (error) {
        console.log(error.message)
    }
}


const getReview = async(req,res)=>{
    try {

        const productId = req.params.productId;
   
    const reviews = await products.findById(productId)
    console.log('reviews',reviews)
    res.json({ reviews });
        
    } catch (error) {
        console.log(error.message)
    }
}


const addReviewButton = async(req,res)=>{
    try {

        if (req.session.user_id) {
            const userId = req.session.user_id;
            const orderId = req.query.id;
            const userData = await User.findById({ _id: userId });
            const orderDetail = await order.findById(orderId);

            console.log('detail', orderDetail);

            const productDetails = await Promise.all(
                orderDetail.product.map(async (product) => {
                    const productDetail = await products.findById(product.productID);
                    return productDetail;
                })
            );
            console.log('orderdetails',orderDetail)
            console.log('details', productDetails);
            res.render('orderReviewPage', { userData, orderDetail, productDetails });
            }
        
    } catch (error) {
        console.log(error.message)
    }
}



const reviewPage = async(req,res)=>{

    try {

        if(req.session.user_id){
            const id = req.query.id
            console.log('paramsid',id)
            const productData = await products.findById(id)
            console.log('p',productData)
            res.render('productDetailReviewPage',{products:productData})
        }else{
            res.render('userLogin',{message : 'please login again'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}






module.exports={

    loadRegister,
    userSignup,
    userLogin,
    insertUser,
    verifyLogin,
    userLogout,
    verifyOtp,
    userHome,
    matchOtp,
    productDetails,
    filterVeg,
    filterNonVeg,
    filterSweets,
    filterDishes,
    searchProducts,
    userProfile,
    resendOtp,
    editProfile,
    updateUserProfile,
    debounceSearch,
    userWallet,
    getOrderData,
    addReview,
    getReview,
    addReviewButton,
    reviewPage
 


    
}




