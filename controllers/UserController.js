const cognito = require("../adapter/cognito");


module.exports.getUsers = async function validate(req, res) {
  var users = await cognito.getUsers();
  res.send(users);
};

module.exports.changeRole = async function validate(req, res) {
  try{
    var result = await cognito.changeRole(req.body.username);
    res.send(result);
  }catch(err){
    res.status(400)
    res.send(err);
  }
}