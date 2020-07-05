var express = require('express');
var router = express.Router();

//var recommenationController = require('./Controllers/RecommendationController');
//var authMiddleWare          = require('./Middleware/AuthMiddleWare');
var userController = require('./controllers/UserController');

//router.post('/recommendation', authMiddleWare.Validate, recommenationController.getRecommendation);
//router.get('/history', authMiddleWare.Validate, recommenationController.getHistory);
router.get('/', userController.getUsers);

module.exports = router;