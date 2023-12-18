const isLogin = async(req,res,next)=>{
    try{

        if(req.session.admin_id){
            next()
            
        }
        else{
            res.redirect('/adminlogin')
        }
      

    }catch(error){
        console.log(error.message)
    }
}


const isLogout = async(req,res,next)=>{
    try{

        if(req.session.user_id){
            res.redirect('/adminhome')
        }
        next()
      
      

    }catch(error){
        console.log(error.message)
    }
}


module.exports ={
    isLogin,
    isLogout
}
