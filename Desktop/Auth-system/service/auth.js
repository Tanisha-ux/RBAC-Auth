const jwt=require("jsonwebtoken");
const dotenv=require("dotenv").config();
const secret = process.env.JWT_SECRET;

function setUser(user){
    
    return jwt.sign(
        {
      name: user.name,  
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "1d" }

    );
}

function getUser(token){
    if(!token)return null;
    try{
        return jwt.verify(token,secret);

    }
    catch(err){
        return null;
    }
    
}

module.exports={
    setUser,
    getUser,
}