const jwt=require('jsonwebtoken')
const User=require('../models/user.js')
const auth=async (req,res,next)=>{
    try{
    const token=req.header('Authorization').replace('Bearer ','')
    // console.log(token)
    const isvalid=jwt.verify(token,process.env.JWT_TOKEN)
    // console.log(isvalid)
    const user=await User.findOne({_id:isvalid._id,'tokens.token':token})
    // console.log(user)
    if(!user) {throw new Error()}
    req.token=token
    req.user=user
    next()
    }catch(e){
        res.status(401).send("auth not valid .")
    }
}
module.exports=auth