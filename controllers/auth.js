const User = require('../models/User');

const sendTokenResponse = (user,statusCode,res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };
    if(process.env.NODE_ENV === 'production'){ options.secure = true; }
    //res.status(statusCode).cookie('token',token,options).json({success:true, token});
    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            tel:user.tel,
            password: user.password,
            role: user.role
        },token
    });

};

exports.register = async (req,res,next) => {
    try{
        const {name, email, tel,password, role} = req.body;
        const user = await User.create({name, email, tel,password, role})
        // // create token
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success:true, token});
        sendTokenResponse(user,200,res);

    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

exports.login = async (req,res,next) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){ return res.status(400).json({success:false, msg:'Please provide an email and password'});}

        const user = await User.findOne({email}).select('+password');
        if(!user) { return res.status(400).json({success:false, msg:'Invalid credentials'});}
        // console.log(user);
        // console.log(email);
        const isMatch = await user.matchPassword(password);
        if(!isMatch) { return res.status(401).json({success:false, msg:'Invalid credentials'});}

        // const token = user.getSignedJwtToken();
        // res.status(200).json({success:true, token});
       // sendTokenResponse(user,name,email,password,role,200,res);
        sendTokenResponse(user,200,res);

    }catch(err){
        return res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
}

exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({success:true, data:user});
};

exports.logout = async (req, res, next) => {  
    // if log out, set token to be none
    res.cookie('token', 'none', {  
        expires: new Date(Date.now() + 10 * 1000),  
        httpOnly: true  
    });  
    res.status(200).json({success:true, data:{}}); 
};