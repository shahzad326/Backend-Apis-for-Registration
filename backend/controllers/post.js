const Post = require('../models/Post.js');
const User = require('../models/User.js');

// Creating a Post
exports.createPost = async (req, res) => {
  try {
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: 'req.body.public_id',
        url: 'req.body.url',
      },
      owner: req.user._id,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.push(post._id);
    await user.save();

    res.status(201).send({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Deleting a Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'You do not have permission to delete',
      });
    }

    // await post.remove();
    await post.deleteOne({ _id: req.params.id });

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);

    user.save();

    return res.status(200).json({
      success: true,
      message: 'Post successfully deleted',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Like and Unlike Post
exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index, 1);

      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post Unliked',
      });
    } else {
      post.likes.push(req.user._id);

      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post Liked',
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Adding Comment on a Post
// exports.createComment = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     const { text } = req.body;

//     // const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: 'Post not found',
//       });
//     }

//     const comment = {
//       comment: text, // Update the field to `comment` instead of `text`
//       owner: req.user._id,
//     };

//     post.comments.push(comment);
//     await post.save();

//     return res.status(201).json({
//       success: true,
//       message: 'Comment created',
//       comment,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found', //
      });
    }

    let commentIndex = -1;

    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;
      await post.save();

      return res.status(200).json({
        success: true,
        message: ' Comment Updated',
      });
    } else {
      post.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });

      await post.save();
      return res.status(200).json({
        success: true,
        message: ' Comment Added',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deleting Comment on the Post
exports.deletePostComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found', //
      });
    }

    // Checking if Owner wanted to delete the comment
    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Comment Id is required',
        });
      }
      post.comments.forEach((item, index) => {
        if (item.id.toString() === req.body.commentId.toString()) {
          post.comments.splice(index, 1);
        }
      });

      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Selected Comment has been Deleted',
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          post.comments.splice(index, 1);
        }
      });
      await post.save();

      return res.status(200).json({
        success: true,
        message: ' Comment Deleted',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Getting Post of Following

exports.getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Caption of Post
exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: ' Unauthenticated',
      });
    }

    post.caption = req.body.caption;
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post updated',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Trending Post
// exports.getTrendingPosts = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .sort({ 'comments.length': -1, 'likes.length': -1 })
//       .limit(10);

//     res.status(200).json({
//       success: true,
//       posts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getTrendingPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $project: {
          _id: 1,
          caption: 1,
          image: 1,
          owner: 1,
          commentsCount: { $size: '$comments' },
          likesCount: { $size: '$likes' },
        },
      },
      {
        $sort: {
          commentsCount: -1,
          likesCount: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      posts: posts.length > 0 ? [posts[0]] : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
