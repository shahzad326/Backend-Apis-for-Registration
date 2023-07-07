const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const {
  register,
  login,
  followUser,
  logout,
  updatePassword,
  updateProfile,
  deleteMyProfile,
  myProfile,
  getUserProfile,
  getALlUser,
  getFollowing,
  getFollowers,
  forgotPassword,
  resetPassword,
} = require('../controllers/user');

const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/follow/:id').get(isAuthenticated, followUser);

router.route('/logout').post(logout);

router.route('/updatePassword/:id').put(isAuthenticated, updatePassword);

router.route('/updateProfile/:id').put(isAuthenticated, updateProfile);

router.route('/deleteUser/me').delete(isAuthenticated, deleteMyProfile);

router.route('/myProfile').get(isAuthenticated, myProfile);

router.route('/getUserProfile/:id').get(isAuthenticated, getUserProfile);

router.route('/allUser').get(getALlUser);

router.route('/getFollowing/:id').get(isAuthenticated, getFollowing);

router.route('/getFollowers/:id').get(isAuthenticated, getFollowers);

router.route('/password/forget').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

module.exports = router;
