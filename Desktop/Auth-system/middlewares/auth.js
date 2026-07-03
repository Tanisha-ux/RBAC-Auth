const {getUser}=require("../service/auth.js");

async function restrictToLoggedInUser(req,res,next){
    const token=req.cookies?.uid;

    if(!token){
        return res.redirect("/login");
    }

    const user=getUser(token);

    
    if(!user){
         return res.redirect("/login");
    }

    req.user=user;
    next();

}


async function isAdmin(req, res, next) {

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
}




module.exports={
    restrictToLoggedInUser,
    isAdmin,
};