
const products = require('../model/productsModel')
const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const order = require('../model/orderModel')
const category = require('../model/categoryModel')
const sharp = require('sharp')





const addProducts = async (req, res) => {
  try {
    if (req.session.admin) {
      const categoriesData = await category.find();
      const allCategoryNames = categoriesData.reduce((allNames, category) => {
        // Concatenate names from each category to the array
        return allNames.concat(category.Name);
      }, []);

      console.log(allCategoryNames);
      res.render('adminAddProducts', { categories: allCategoryNames, message: '' });
    } else {
      res.render('userLogin', { message: 'Please Login to Continue' });
    }
  } catch (error) {
    console.log(error.message);
  }
};





const addingProducts = async (req, res) => {
  try {
    if (req.session.admin) {
      const images = req.files.map((file) => file.filename);
      const name = req.body.name;
      const description = req.body.description;
      const subcat = req.body.subcat;
      const category = req.body.category;
      const price = req.body.price;
      
      

      const croppedImagePaths = await Promise.all(
        images.map(async (image) => {
          try {
          
            const outputImagePath = `./public/uploads/cropped_${image}`;

            await sharp('./public/uploads/' + image)
              .extract({ left: 0, top: 0, width: 300, height: 300 })
              .jpeg()
              .toFile(outputImagePath);

            
            return `cropped_${image}`;
          } catch (error) {
            console.log('Error during image extraction:', error.message);
            throw error;
          }
        })
      );

    
      const product = new products({
        name: name,
        description: description,
        image: croppedImagePaths, 
        subcat: subcat,
        category: category,
        price: price,
      });

    
      const productData = await product.save();

      if (productData) {
        console.log(productData);
        res.render('adminAddProducts', { message: 'PRODUCT ADDED SUCCESSFULLY !!' });
      } else {
        res.send('failed to upload');
      }
    } else {

      res.render('userLogin', { message: 'Please Login to Continue' });
    }
  } catch (error) {
    
    console.log(error.message);
  }
};






  
  const editProducts = async(req,res)=>{
        
    try{
        if(req.session.admin){
            const id = req.query.id
            const productData = await products.findById(id)
       
              if(productData){
              res.render('adminEditProducts',{product:productData})
            }else{
                console.log(error)
            }
        }else{
            res.render('userLogin',{message : 'Please Login to Continue'})
        }
     
    }catch(error){
        console.log(error.message)
    }

    


}
 

const viewProducts = async (req, res) => {
  try {
      const page = req.query.page || 1;
      const productPerPage = 5;

      const totalProducts = await products.countDocuments({ 
        softDelete : 0 });
      const totalPages = Math.ceil(totalProducts / productPerPage);

      if (req.session.admin) {
          const productData = await products.find({ softDelete : 0 })
              .skip((page - 1) * productPerPage)
              .limit(productPerPage);

          res.render('adminViewProducts', { product: productData, page, totalPages });
      } else {
          res.render('userLogin', { message: 'Please Login To Continue' });
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
  }
};






   

const saveProducts = async (req, res) => {
   
try {
    if(req.session.admin){
        const {name,price,category,subcat,description} = req.body
    
        if(req.file){
            const image = req.file.filename;
            const productData = await products.findByIdAndUpdate({_id:req.body.id},
                {$set:{name:name,price:price,subcat:subcat,category:category,image:image}})
        } else{
        const productData = await products.findByIdAndUpdate({_id:req.body.id},
                {$set:{name:name,price:price,subcat:subcat,category:category,description:description}})
        }
        res.redirect('/viewproducts')
    
    }else{
        res.render('userLogin',{message:'Please Login To Continue'})
    }
  
  } catch (error) {
    console.error(error.message);
  }
}




const deleteProduct = async (req, res) => {
  const id = req.query.id;

  try {
      if (req.session.admin) {
          // Find the product by ID
          const productData = await products.findById(id);

          if (productData) {
              // Soft delete by updating the 'softDelete' field
              await products.findByIdAndUpdate(id, { softDelete: 1 });

              console.log(`Product with ID ${id} soft-deleted successfully.`);
              res.redirect('/viewproducts');
          } else {
              console.log(`Product with ID ${id} not found.`);
              res.status(404).send('Product not found');
          }
      } else {
          res.render('userLogin', { message: 'Please Login To Continue' });
      }
  } catch (error) {
      console.error(`Error deleting product: ${error.message}`);
      res.status(500).send('Internal Server Error');
  }
};




module.exports = {
    addingProducts,
    addProducts,
    deleteProduct,
    saveProducts,
    viewProducts,
    editProducts
}