'use strict';

var utils = require('../utils/writer.js');
var Validate = require('../service/ValidateService');

module.exports.validate = function validate (req, res, next, body) {
  Validate.validate(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      res.status(400).send(response)
    });
};
