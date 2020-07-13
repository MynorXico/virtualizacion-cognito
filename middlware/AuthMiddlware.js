var ValidateService = require('../service/ValidateService');

exports.Validate = async function(req, res, next) {
    console.log("Req headers: ", req.headers);
    try{
        var token = req.headers.authorization.split(' ')[1];
    }catch(e){
        res.status(400);
        res.send(e);
    }
    var body = {};
    body.jwt = token; 
    try {
        var user = await ValidateService.validate(body);
        req.user = user;
        return next();
    }catch(e){
        res.status(401);
        res.send(e);
    }
}