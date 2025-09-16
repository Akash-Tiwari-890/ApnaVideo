const User = require("../models/user.js");   


module.exports.getregister = (req,res)=>{
    res.render("users/signup.");
}

module.exports.getlogin = (req,res)=>{
    res.render("users/login.");
}

module.exports.postregister =  async(req,res)=>{
    console.log(req.body);
    let {username , email , password} = req.body;
    const user = new User({username , email}); 
   const reguser =  await User.register(user , password ) 
   console.log(reguser);
   req.login(reguser , (err)=>{
    if(err){
        return next(err);
    }
    req.flash("success"  , "User Registered Sucesfully");
     res.redirect("/apnavideo") 
        
   })
  
}


module.exports.postlogin =  async (req, res) => {
    req.flash("success" , "Welcome Back to apnavideo confrencing");
    res.redirect("/apnavideo" );    
}



module.exports.logout= (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged Out Successfully"); // ✅ Still inside session context
    res.redirect("/apnavideo");
  });
}