
const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404).render('404'); // Assuming '404' is the name of your error handling page
    next(error); // Pass the error to the next error handling middleware
  };
  


const errorHandler = (err,req,res,next)=>{
    
    const statusCode = res.statusCode == 200?500:res.statusCode
    res.status(statusCode)
    // const handler = res.({message : err.message})  
    console.log(err.message)
}

module.exports = {notFound}