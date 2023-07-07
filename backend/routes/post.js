const express = require('express');
const {
  createPost,
  likeAndUnlikePost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
  commentOnPost,
  deletePostComment,
  getTrendingPosts,
} = require('../controllers/post');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.route('/post/upload').post(isAuthenticated, createPost);

router
  .route('/post/:id')
  .get(isAuthenticated, likeAndUnlikePost)
  .delete(isAuthenticated, deletePost);

router.route('/posts').get(isAuthenticated, getPostOfFollowing);

router.route('/updateCaption/:id').put(isAuthenticated, updateCaption);

router
  .route('/post/comment/:id')
  .put(isAuthenticated, commentOnPost)
  .delete(isAuthenticated, deletePostComment);

router.route('/getTrendingPosts').get(isAuthenticated, getTrendingPosts);

module.exports = router;
