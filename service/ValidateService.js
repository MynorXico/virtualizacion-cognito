"use strict";
const cognito = require("../adapter/cognito");

/**
 * Verifies if a user exists
 *
 * body Jwt JWT object that needs to bes validated (optional)
 * returns User
 **/
exports.validate = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      var user = await cognito.validate(body.jwt);
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
};
