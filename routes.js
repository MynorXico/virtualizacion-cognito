var express = require('express');
var router = express.Router();

//var recommenationController = require('./Controllers/RecommendationController');
var authMiddleWare          = require('./middlware/AuthMiddlware');
var userController = require('./controllers/UserController');

//router.post('/recommendation', authMiddleWare.Validate, recommenationController.getRecommendation);
//router.get('/history', authMiddleWare.Validate, recommenationController.getHistory);
router.get('/', userController.getUsers);
router.post('/changeRole', authMiddleWare.Validate, userController.changeRole)
module.exports = router;