const express = require('express');
const profileRouter = require('../Controller/profileController');



const router = express.Router();



router.put('/profile',profileRouter.updateUser)
router.get('/profile',profileRouter.getUser)
router.put('/change-password', profileRouter.changePassword);




module.exports = router;