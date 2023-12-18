
const products = require('../model/productsModel')
const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const order = require('../model/orderModel')
const category = require('../model/categoryModel')
const sharp = require('sharp')
const coupon = require('../model/couponModel')
const banner = require('../model/bannerCollection')





const adminLogin = async (req, res) => {
    try {
        res.render('adminLogin',{message:''})
    } catch (error) {
        console.log(error.message)
    }
}




const adminHome = async (req, res) => {
  try {
    if (req.session.admin) {

      const totalUsers = await User.find(); // Use consistent naming
      console.log('users',totalUsers)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

      const totalOrders = await order.countDocuments({
        createdAt: { $gte: today },
      });

      const totalAmountResult = await order.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalPrice' },
          },
        },
      ]);

      const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

      // Get the total number of products
      const totalProducts = await products.countDocuments();

      // Get the total number of users

      res.render('adminHome', { totalOrders, totalAmount, totalProducts });
    } else {
      res.render('userLogin', { message: 'Please Login to Continue' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


          

        



const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/userlogin')
    } catch (message) {
        console.log(error.message)
    }
}





const adminUserDetails = async (req, res) => {
    try {
    if(req.session.admin){
        
    }
        const page = req.query.page || 1
            const userPerPage = 5

            const totalUsers = await User.countDocuments()
            const totalPages = Math.ceil(totalUsers / userPerPage)

        if (req.session.admin) {
            const userData = await User.find({ is_admin: 0 })
         
            .skip((page - 1) * userPerPage)
            .limit(userPerPage)
            res.render('adminUserDetails', { users: userData,page,totalPages })
           
         
        } else {
            res.render('userLogin',{message : 'Please Login to Continue'})
        }  
    } catch (error) {
        console.log(error.message)
    }
}





const adminHomee = async (req, res) => {
    try {
      if (req.session.admin) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day
  
        const totalOrders = await order.countDocuments({
          createdAt: { $gte: today },
        });
  
        const totalAmountResult = await order.aggregate([
          {
            $match: {
              createdAt: { $gte: today },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalPrice' },
            },
          },
        ]);
  
        const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
  
        // Get the total number of products
        const totalProducts = await products.countDocuments();
  
        console.log('Total Orders (Today):', totalOrders);
        console.log('Total Amount (Today):', totalAmount);
        console.log('Total Products:', totalProducts);
  
        res.render('adminHome', { totalOrders, totalAmount, totalProducts });
      } else {
        res.render('userLogin', { message: 'Please Login to Continue' });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  







    const blockUser = async (req, res) => {

        try {
            if(req.session.admin){

                const id = req.query.id;
                const user = await User.findById(id);
        
                if (!user) {
                    return res.status(404).json({ message: 'User not found', success: false });
                }else{
               
                user.is_blocked = !user.is_blocked;
                if(user.is_blocked === true){
                  req.session.user_id = null
                }
                await user.save();
               }
                res.redirect('/adminUserDetails')
        
            }else{
                res.render('userLogin',{message : 'Please Login to Continue'})
            }
        
           } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', success: false });
        }
    };


  
  



   
        
        
    const searchUsers = async (req, res) => {
        try {
            if(req.session.admin){

                const searchQuery = req.query.search;
    
                const isNumeric = !isNaN(searchQuery)
        
                let queryConditions = [];
        
                if (isNumeric) {
                    queryConditions.push({ mobile: searchQuery }); // Search by mobile number
                } else {
                    queryConditions.push(
                        { first_name: { $regex: new RegExp(searchQuery, 'i') } },
                        { second_name: { $regex: new RegExp(searchQuery, 'i') } },
                        { email: { $regex: new RegExp(searchQuery, 'i') } }
                    );
                }
        
                const users = await User.find({ $or: queryConditions });
        
                if (users.length > 0) {
                    res.render('adminSearchUser', { users: users });
                } else {
                    res.render('noResults', { query: searchQuery });
                }
            }else{
                res.render('userLogin',{message:'Please Login To Continue'})
            }
          
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    };



    const searchProducts = async (req, res) => {
        try {
            if(req.session.admin){

                const searchQuery = req.query.search
      
                const product = await products.find({
                    $or: [
                        { name: { $regex: new RegExp(searchQuery, 'i') } },
                        { category: { $regex: new RegExp(searchQuery, 'i') } },
                        { subcat: { $regex: new RegExp(searchQuery, 'i') } },
                        { price: { $regex: new RegExp(searchQuery, 'i') } }
                     
                        ]
                });
                console.log(product)
        
                if (product.length > 0) {
                    res.render('adminSearchProducts', { products : product });
                } else {
                    res.render('noResults', { query: searchQuery });
                }
            }else{
                res.render('userLogin',{message:'Please Login To Continue'})
            }
       
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    };
  


    const adminViewOrderDetails = async(req,res)=>{
        
        try {
            if(req.session.admin){
                const orderdetails = await order.find().populate('userID')
                res.render('adminViewOrderDetails',{orderdetails})
            }else{
                res.render('userLogin',{message:'Please Login To Continue'})
            }
           
        } catch (error) {
            console.log(error.message)
        }
    }
    

    const updateOrderStatus = async(req,res)=>{

        try{
            if(req.session.admin){
                console.log('update caled')
                const { orderId, newStatus } = req.body;
                console.log('fn called', orderId,newStatus)
    
                const updatedOrder = await order.findByIdAndUpdate(
                    orderId,
                    { status: newStatus },
                    { new: true } 
                );
        
                if (!updatedOrder) {
                    return res.status(404).json({ error: 'Order not found' });
                }
        
                res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    
            }else{
                res.render('userLogin',{message:'Please Login To Continue'})
            }
       
        }catch(error){
            console.log(error.message)
        }
    }



    const saveCategory = async (req, res) => {
      try {
        if (req.session.admin) {
          const categoryName = req.body.category;
    
          // Check if any category document exists
          const existingCategory = await category.findOne();
    
          if (existingCategory) {
            // If a category exists, push the new category to the array
            await category.updateOne({}, { $push: { Name: categoryName } });
            console.log(`Category "${categoryName}" added to the existing document.`);
            res.status(200).json({
              success: true,
              message: `Category "${categoryName}" added to the existing document.`,
            });
          } else {
            // If no category exists, create a new document with the new category
            const newCategory = new category({ Name: [categoryName] });
            await newCategory.save();
            console.log(`Category "${categoryName}" added successfully.`);
            res.status(200).json({
              success: true,
              message: `Category "${categoryName}" added successfully.`,
            });
          }
        } else {
          // If the session is not admin
          res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    };
    


    const chartData = async (req, res) => {
      try {
        const orderData = await order.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              orderCount: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              orderCount: 1
            }
          },
          {
            $sort: {
              year: 1,
              month: 1
            }
          }
        ]);
    
        console.log(orderData);
        res.json(orderData);
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };
    


const reports = async(req,res)=>{

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyOrders = await order.find({
      createdAt: { $gte: today },
      status: 'Order Placed'
    });
    console.log(dailyOrders)
    res.render('reports',{dailyOrders})
  } catch (error) {
    console.log(error.message)
  }
}


const fetchReports = async (req, res) => {
  try {
    let currentDate = new Date();
    let startDate;
    let endDate;

    const { timeRange, queryStartDate, queryEndDate } = req.query;

    switch (timeRange) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;

      case 'weekly':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;

      case 'monthly':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        break;

      case 'yearly':
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;

      case 'custom':
        // Assuming queryStartDate and queryEndDate are present in the request query
        startDate = new Date(queryStartDate);
        endDate = new Date(queryEndDate);
        break;

      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : currentDate.toISOString().split('T')[0];

    console.log('startDate', formattedStartDate);
    console.log('endDate', formattedEndDate);

    const orders = await order.find({
      createdAt: { $gte: startDate, $lte: endDate || currentDate },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const customDateReports = async(req,res)=>{

  try {
     const date1 = req.query.startDate
     const date2 = req.query.endDate
     
     console.log(date1, date2)

     const orders = await order
     .aggregate([
       {
         $match: {
           createdAt: {
             $gte: new Date(date1),
             $lte: new Date(date2),
           },
         },
       },
     ]);
 
     res.json(orders);
    
  } catch (error) {
    console.log(error.message)
  }
}





const lastWeekChart = async (req, res) => {

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - today.getDay());

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7); // Adjust the number of days based on your definition of "last week"

    const orderSummary = await order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          label: '$_id',
          value: '$orderCount',
          _id: 0,
        },
      },
    ]);

    console.log('Last Week Order Summary:', orderSummary);
    res.json(orderSummary);
  } catch (error) {
    console.error('Error fetching last week order summary:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const productChart = async (req, res) => {
  try {
    const productsData = await products.aggregate([
      {
        $group: {
          _id: '$category',
          totalCount: { $sum: 1 }, 
        },
      },
    ]);

    

   

    console.log('productchart', productsData);
    res.json(productsData );

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const saveCoupon = async(req,res)=>{
  try {

    const { code, discount, date, minimumprice } = req.body;

    console.log(code, discount, date)
    const newCoupon = new coupon({
      code: code,
      discount: discount,
      expireDate: date,
      minprice: minimumprice
    });

    // Save the coupon to the database
    const savedCoupon = await newCoupon.save();

    res.status(201).json(savedCoupon);
    
  } catch (error) {
    console.log(error.message)
  }
}




const validatingCoupon = async (req, res) => {
  console.log('validating');
  const couponCode = req.query.code;
  console.log('c fn called', couponCode);

  try {
    const foundCoupon = await coupon.findOne({ code: couponCode });

    if (foundCoupon) {
      const isValid = isValidCoupon(foundCoupon);
      
      if (isValid) {
        res.json({ valid: true, discount: foundCoupon.discount, minimumprice: foundCoupon.minprice });
      } else {
        res.json({ valid: false, expired: true });
      }
    } else {
      console.log('no coupon found')
      res.json({ valid: false, expired: false });
    }
  } catch (error) {
    console.error('Error checking coupon:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

function isValidCoupon(coupon) {
  return coupon.expireDate && new Date() < new Date(coupon.expireDate);
}





const updateOfferPrice = async (req, res) => {
  try {
    console.log('offer called');
    const { category, percentageOffer } = req.body;

    const productsToUpdate = await products.find({ category: category });

    console.log('offerproducts', productsToUpdate);

    const updatePromises = productsToUpdate.map(async (product) => {
      const discountedPrice = product.price * (1 - percentageOffer / 100);

     
      product.discount = discountedPrice;

      await product.save();
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Discounts updated successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};




const uploadBanner = async (req, res) => {
  try {
    const images = req.files.map(file => file.filename);

    // Check if a banner already exists
    const existingBanner = await banner.findOne();

    if (existingBanner) {
      // If a banner exists, update its image
      existingBanner.image = images;
      await existingBanner.save();
    } else {
      // If no banner exists, create a new one
      const newBanner = new banner({ image: images });
      await newBanner.save();
    }

    res.status(201).json({
      success: true,
      message: 'Banner uploaded successfully',
      images: images,
    });
  } catch (error) {
    console.error('Error uploading banner:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};





const banners = async(req,res)=>{

  try {
    res.render('banner.ejs')
  } catch (error) {
    console.log(error.message)    
  }
}






module.exports = {
    adminHome,
    adminLogin,
    adminLogout,
    adminUserDetails,
    adminHomee,
    blockUser,
    searchUsers,
    searchProducts,
    adminViewOrderDetails,
    updateOrderStatus,
    saveCategory,
    chartData,
    productChart,
    reports,
    fetchReports,
    customDateReports,
    lastWeekChart,
    saveCoupon,
    validatingCoupon,
    updateOfferPrice,
    banners,
    uploadBanner

}

