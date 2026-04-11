const express = require('express');
const router = express.Router();

const { 
    test,
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    googleLogin,
    forgotPassword,
    resetPassword,
    deleteAccount

} = require('../controllers/authController.js')


router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.post('/logout', logoutUser);
router.post('/update-profile', updateProfile);

router.post('/google-login', googleLogin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/delete-account', deleteAccount);

module.exports = router;