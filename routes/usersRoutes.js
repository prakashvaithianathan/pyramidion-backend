const express = require('express');
const userController = require('../controllers/userController');


const router = express.Router();


//This Route is used to create/register new user
router.post('/create', userController.createAppUser);

//This Route is used to login the user
router.post('/login', userController.loginUser);

//This Route is used for get user data
router.get('/get', userController.getUser);

//This Route is used for edit the user
router.put('/edit', userController.editUser);

//This Route is used for soft delte the user
router.put('/delete', userController.deleteUser);
module.exports = router;
