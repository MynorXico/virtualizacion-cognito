const axios = require("axios");

const jwkToPem = require("jwk-to-pem");
const User = require("../models/user").User;
const AwsUser = require("../models/awsUser").awsUser;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const jwt_decode = require("jwt-decode");

dotenv.config();

var AWS = require("aws-sdk");

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const usersPoolName = process.env.USER_POOL_NAME;

exports.changeRole = async (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      var userPools = await getPools();
    } catch (err) {
      console.error(err);
      reject({ error: true, message: "Error al obtener pool" });
    }

    var usersPool = userPools.UserPools.find(
      (pool) => pool.Name == usersPoolName
    );

    // Verificar si usuario ya es admin
    var params = {
      UserPoolId: usersPool.Id,
      Username: username,
    };
    var isAdmin = false;
    cognitoIdentityServiceProvider.adminListGroupsForUser(params, function (
      err,
      data
    ) {
      if (err) {
        console.log(err, err.stack);
        reject({
          error: true,
          message: "Error al eliminar usuario de group",
          aws: err,
        });
      } else {
        isAdmin = data.Groups.length > 0;
        console.log(isAdmin);
        var params = {
          GroupName: "Administrator",
          UserPoolId: usersPool.Id,
          Username: username,
        };
        if (isAdmin) {
          cognitoIdentityServiceProvider.adminRemoveUserFromGroup(
            params,
            function (err, data) {
              if (err) {
                console.log(err);
                reject({
                  error: true,
                  message: "Error al eliminar usuario de group",
                  aws: err,
                });
              } else {
                resolve({
                  response: data,
                });
              }
            }
          );
        } else {
          cognitoIdentityServiceProvider.adminAddUserToGroup(params, function (
            err,
            data
          ) {
            if (err) {
              console.error(err);
              reject({
                error: true,
                message: "Error al agregar usuario a grupo",
                aws: err,
              });
            } else {
              resolve({
                response: data,
              });
              console.log("Response: ", data);
            }
          });
        }
      }
    });
  });
};
exports.getUserGroups = async (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      var userPools = await getPools();
    } catch (err) {
      console.error(err);
      reject({ error: true, message: "Error al obtener pool" });
    }

    var usersPool = userPools.UserPools.find(
      (pool) => pool.Name == usersPoolName
    );

    // Verificar si usuario ya es admin
    var params = {
      UserPoolId: usersPool.Id,
      Username: username,
    };    
    cognitoIdentityServiceProvider.adminListGroupsForUser(params, function (
      err,
      data
    ) {
      if (err) {
        console.log(err, err.stack);
        reject({
          error: true,
          message: "Error al eliminar obtener rol de usuario",
          aws: err,
        });
      } else {
        isAdmin = data.Groups.length > 0;
        resolve(isAdmin?'admin':'customer');
        console.log(isAdmin);
      }
    });
  });
};
exports.getUsers = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      var userPools = await getPools();
    } catch (err) {
      console.error(err);
      reject({ error: true, message: "Error al obtener pools" });
    }
    var usersPool = userPools.UserPools.find(
      (pool) => pool.Name == usersPoolName
    );
    cognitoIdentityServiceProvider.listUsers(
      { UserPoolId: usersPool.Id },
      function (err, data) {
        if (err) {
          console.error(err);
          reject({
            error: true,
            message: "Error al obtener usuarios del pool",
          });
        } else {
          var mappedUsers = data.Users.map((user) => {
            var username = user.Username;
            var params = {
              UserPoolId: usersPool.Id,
              Username: username,
            };
            return new AwsUser(user);
          });
          resolve(mappedUsers);
        }
      }
    );
  });
};

getPools = async () => {
  return new Promise(async (resolve, reject) => {
    var pools = cognitoIdentityServiceProvider.listUserPools(
      { MaxResults: 2 },
      function (err, data) {
        if (err) {
          console.error(err);
          reject({
            error: true,
            message: "Error al obtener pool de direcciones",
          });
        } else {
          resolve(data);
        }
      }
    );
  });
};

exports.validate = async (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      var decoded = jwt_decode(token);
    } catch (err) {
      reject({
        error: true,
        message: "Not a valid JWT token",
      });
    }

    const cognito_url = `${decoded.iss}/.well-known/jwks.json`;

    await axios
      .get(cognito_url)
      .then(({ status, data }) => {
        pems = {};
        var keys = data.keys;
        for (var i = 0; i < keys.length; i++) {
          var key_id = keys[i].kid;
          var modulus = keys[i].n;
          var exponent = keys[i].e;
          var key_type = keys[i].kty;
          var jwk = { kty: key_type, n: modulus, e: exponent };
          var pem = jwkToPem(jwk);
          pems[key_id] = pem;
        }

        var decodedJwt = jwt.decode(token, { complete: true });

        if (!decodedJwt) {
          reject({
            error: true,
            message: "Not a valid JWT token",
          });
        }

        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
          reject({
            error: true,
            message: "Not a valid JWT token",
          });
        }

        jwt.verify(token, pem, function (err, payload) {
          if (err) reject({ success: false, message: "Not a valid JWT token" });
          var user = new User(payload);
          resolve(user);
        });
      })
      .catch((e) => {
        reject(e);
      });
  });
};
