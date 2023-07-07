const express = require('express');
const {
  getAllProducts,
  createProduct,

  deleteProduct,
  getProductDetails,
  addToCart,
  removeFromCart,
} = require('../controllers/product');

const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.route('/products/new').post(isAuthenticated, createProduct);

router.route('/products').get(getAllProducts);

router.route('/products/:id').delete(isAuthenticated, deleteProduct);

router.route('/products/:id').get(getProductDetails);

router.route('/addToCart/:id').post(isAuthenticated, addToCart);

router.route('/removeFromCart/:id').delete(isAuthenticated, removeFromCart);

module.exports = router;
