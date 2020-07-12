const cognito = require("../adapter/cognito");

module.exports.getUsers = async function validate(req, res) {
  console.log("Before getting: ");
  var users = await cognito.getUsers();
  console.log("After getting");
  for (var i = 0; i < users.length; i++) {
    try {
      var group = await cognito.getUserGroups(users[i].username);
      users[i].role = group;
    } catch (err) {
      res.status(501);
      res.send(err);
    }
  }
  res.send(users);
};

module.exports.changeRole = async function validate(req, res) {
  try {
    var result = await cognito.changeRole(req.body.username);
    res.send(result);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};
