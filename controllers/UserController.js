const cognito = require("../adapter/cognito");


module.exports.getUsers = async function validate(req, res) {
  var users = await cognito.getUsers();
  res.send(users);
};
