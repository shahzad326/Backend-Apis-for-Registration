const User = require('../models/User.js');
const Post = require('../models/Post.js');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// User Registration
exports.register = catchAsyncErrors(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists',
      });
    }

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: 'sample_id', url: 'sample_url' },
    });

    // For Just Registration
    // res.status(201).json({
    //   success: true,
    //   user,
    // });

    // By Doing Regisration, you also got Login
    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.status(200).cookie('token', token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// User Login
exports.login = catchAsyncErrors(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'User does not exists',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Incorrect Password',
      });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.status(200).cookie('token', token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res) => {
  try {
    res
      .status(200)
      .cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: 'Logged out',
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// For Following User
exports.followUser = catchAsyncErrors(async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not Found',
      });
    }

    if (loggedInUser.following.includes(userToFollow._id)) {
      const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
      loggedInUser.following.splice(indexfollowing, 1);

      const indexfollower = userToFollow.followers.indexOf(loggedInUser._id);
      userToFollow.followers.splice(indexfollower, 1);

      await loggedInUser.save();
      await userToFollow.save();
      return res.status(200).json({
        success: true,
        message: 'User UnFollowed',
      });
    } else {
      loggedInUser.following.push(userToFollow._id); // jisko ham follow kr rhe hyn
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: 'User Followed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update Pasworrd
exports.updatePassword = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please Provide a old password and new password',
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password Updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update Profile

exports.updateProfile = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile Updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// Delete my Profile
// exports.deleteMyProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const posts = user.posts;
//     await user.remove();

//     // Logout user after Deleting user
//     res.cookie('token', null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//     });

//     // Deleting All Post of the user
//     for (let i = 0; i < posts.length; i++) {
//       const post = await Post.findById(posts[i]);

//       await post.remove();
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Profile Deleted',
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.deleteMyProfile = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const following = user.following;
    const userId = user._id;

    await user.deleteOne();

    // Logout user after Deleting user
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // Deleting All Post of the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.deleteOne();
    }

    // Removing User from Following
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // Removing User from Following;s Follower
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);

      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Profile Deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// View Profile MY Own
exports.myProfile = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('posts');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// View Profile Kise ke bhe
exports.getUserProfile = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('posts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Geting all the User
exports.getALlUser = catchAsyncErrors(async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all followers of a user
exports.getFollowers = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const followers = user.followers;

    return res.status(200).json({
      success: true,
      followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all following of a user
exports.getFollowing = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const following = user.following;

    return res.status(200).json({
      success: true,
      following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Forgot Password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: ' User not found',
//       });
//     }
//     const resetPasswordToken = user.getResetPasswordToken();

//     await user.save();

//     const resetUrl = `${req.protocol}://${req.get(
//       'host'
//     )}/api/v1/password/reset/${resetPasswordToken}`;

//     const message = `Reset Password by clicking on the Link ${resetUrl}`;

//     try {
//       await sendEmail ({
//         email: user.email,
//         subject: 'Reset Password',
//         message,
//       });

//       return res.status(200).json({
//         success: true,
//         message: `Email send to  ${user.email} Successfully`,
//       });
//     } catch (error) {
//       (user.resetPasswordToken = undefined),
//         (user.resetPasswordExpires = undefined);
//       await user.save();
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('Invalid Email ', 404));
  }

  // Get Reset Password Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v2/password/reset/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. To reset Your Password, Click on the Link below \n\n ${resetPasswordUrl}  \n
  Thank you \n
  E Commerce Shop
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email Sent to User Successfully',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // CReating Token Hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        'Reset Password Token is Invalid or has been expired',
        404
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});
