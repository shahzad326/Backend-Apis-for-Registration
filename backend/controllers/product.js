const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/User.js');

// Create Product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Products

exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();
  const apiFeature = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage); // Execute the pagination method

  const products = await apiFeature.query; // Execute the query method once

  const filteredProductsCount = products.length;

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// Get Single Product  Get Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // if (!product) {
  //   return res.status(500).json({
  //     success: false,
  //     message: 'Product not found',
  //   });
  // }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted',
  });
});

// Add Product to Cart
// exports.addToCart = catchAsyncError(async (req, res, next) => {
//   const productId = req.params.id;
//   const { quantity } = req.body;

//   // Find the product by ID
//   const product = await Product.findById(productId);

//   if (!product) {
//     return next(new ErrorHandler('Product not found', 404));
//   }

//   // Create the cart item
//   const cartItem = {
//     product: product._id,
//     quantity: Number(quantity),
//     price: product.price,
//     name: product.name,
//     image: product.images,
//   };

//   // Add the cart item to the user's cart
//   req.user.cart.push(cartItem);
//   await req.user.save();

//   res.status(200).json({
//     success: true,
//     message: 'Product added to cart',
//   });
// });

// Add Product to Cart
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  // Find the product by ID
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if the product is already in the cart
  const cartItemIndex = req.user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (cartItemIndex !== -1) {
    // Product already exists in the cart, update the quantity
    req.user.cart[cartItemIndex].quantity += Number(quantity);
  } else {
    // Product doesn't exist in the cart, create a new cart item
    const cartItem = {
      product: product._id,
      quantity: Number(quantity),
      price: product.price,
      name: product.name,
      image: product.images,
    };

    req.user.cart.push(cartItem);
  }

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Product added to cart',
  });
});

// Remove from the cart
exports.removeFromCart = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;

  const index = req.user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index === -1) {
    return next(new ErrorHandler('Product not found in cart', 404));
  }

  req.user.cart.splice(index, 1);
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from cart',
  });
});
