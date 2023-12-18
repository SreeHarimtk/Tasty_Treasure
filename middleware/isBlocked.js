const checkBlockedStatus = (req, res, next) => {
    
    const user = req.session.user;
  
    if (user && user.is_blocked) {
      return res.redirect('/login');
    }
  
    next();
  };