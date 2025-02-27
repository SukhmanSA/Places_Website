const HttpError = require("../models/http-error")
const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {

    if(req.method === "OPTIONS"){
        next()
    }

    try{
    const token = req.headers.authorization.split(" ")[1]
    if(!token){
        throw new Error("Authorization failed!")
    }
    const decodedToken = jwt.verify(token,"super_secret_key");
    req.userData = { userId:decodedToken.userId };
    next()
    }catch(err){
        return next(new HttpError("Authorization failed!", 401))   
    }

}