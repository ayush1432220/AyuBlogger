import ErrorHandler from "../middlewares/error.js";
import { AsyncError } from "../middlewares/AsyncError.js";
import { User } from "../models/user.js";
import { Post } from "../models/post.js";
import mongoose from "mongoose";

// Middleware to check if user owns the post
const checkPostOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    
    // Check if the current user is the owner of the post
    if (post.owner.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Access denied. You can only modify your own posts", 403));
    }
    
    req.post = post; // Store post in request for later use
    next();
  } catch (error) {
    return next(new ErrorHandler("Error checking post ownership", 500));
  }
};

// Input validation and sanitization middleware
const validatePostInput = (req, res, next) => {
  const { title, content } = req.body;
  
  if (!title || title.trim().length === 0) {
    return next(new ErrorHandler("Title is required", 400));
  }
  
  if (!content || content.trim().length === 0) {
    return next(new ErrorHandler("Content is required", 400));
  }
  
  // Sanitize inputs (basic example - you might want to use a library like validator.js)
  req.body.title = title.trim();
  req.body.content = content.trim();
  
  // Length validation
  if (req.body.title.length > 200) {
    return next(new ErrorHandler("Title must be less than 200 characters", 400));
  }
  
  if (req.body.content.length > 10000) {
    return next(new ErrorHandler("Content must be less than 10000 characters", 400));
  }
  
  next();
};

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map();
const checkRateLimit = (req, res, next) => {
  const userId = req.user._id.toString();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Max 10 posts per 15 minutes
  
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }
  
  const userRequests = rateLimitMap.get(userId);
  
  // Remove old requests outside the time window
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return next(new ErrorHandler("Too many requests. Please try again later", 429));
  }
  
  validRequests.push(now);
  rateLimitMap.set(userId, validRequests);
  
  next();
};

//For showing a specific post - PUBLIC (no auth required)
export const showPost = AsyncError(async (req, res) => {
  console.log("Show Route is called");
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid post ID" });
  }
  
  const post = await Post.findById(id).populate(
    "owner",
    "name profile_image_url"
  );
  
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({
    success: true,
    message: "Post found",
    post,
  });
});

//For adding new Post - REQUIRES AUTHENTICATION
export const newPost = AsyncError(async (req, res, next) => {
  console.log("New Post Route is called");
  
  // Apply rate limiting for post creation
  checkRateLimit(req, res, () => {
    validatePostInput(req, res, async () => {
      try {
        const { title, content, tags } = req.body;

        let cover_image_url = null;
        if (req.file) {
          // Validate file type and size (should be done in multer middleware too)
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new ErrorHandler("Invalid file type. Only images are allowed", 400));
          }
          cover_image_url = req.file.path;
        }

        // Validate and sanitize tags if provided
        let processedTags = [];
        if (tags) {
          if (Array.isArray(tags)) {
            processedTags = tags.filter(tag => 
              typeof tag === 'string' && 
              tag.trim().length > 0 && 
              tag.trim().length <= 50
            ).map(tag => tag.trim().toLowerCase());
          } else if (typeof tags === 'string') {
            processedTags = [tags.trim().toLowerCase()];
          }
          
          // Limit number of tags
          if (processedTags.length > 10) {
            return next(new ErrorHandler("Maximum 10 tags allowed", 400));
          }
        }

        const post = await Post.create({
          title,
          content,
          cover_image_url,
          tags: processedTags,
          owner: req.user._id,
        });

        // Populate owner info before sending response
        await post.populate("owner", "name profile_image_url");

        res.status(201).json({
          success: true,
          message: "Post created successfully",
          post,
        });
      } catch (error) {
        next(new ErrorHandler("Error creating post", 500));
      }
    });
  });
});

//For fetching the users all post - REQUIRES AUTHENTICATION for own posts, PUBLIC for others
export const userPosts = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log(`users post is called for user: ${id}`);
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  // Check if user exists
  const userExists = await User.findById(id);
  if (!userExists) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // If requesting own posts and authenticated, show all posts including drafts
  // If requesting others' posts, show only published posts
  let query = { owner: id };
  
  // If user is not authenticated or not viewing own posts, only show published posts
  if (!req.user || req.user._id.toString() !== id) {
    query.status = 'published'; // Assuming you have a status field
  }

  const userPost = await Post.find(query)
    .populate("owner", "name profile_image_url")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    posts: userPost,
  });
});

// Delete Post - REQUIRES AUTHENTICATION AND OWNERSHIP
export const deletePost = AsyncError(async (req, res, next) => {
  console.log("Post deletion requested");
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  // Use the ownership check middleware
  checkPostOwnership(req, res, async () => {
    try {
      await Post.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(new ErrorHandler("Error deleting post", 500));
    }
  });
});

// Edit Post - REQUIRES AUTHENTICATION AND OWNERSHIP
export const editPost = AsyncError(async (req, res, next) => {
  console.log("Edit post request received");
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  // Use ownership check and input validation
  checkPostOwnership(req, res, () => {
    validatePostInput(req, res, async () => {
      try {
        const { title, content, tags } = req.body;
        
        // Process tags similar to newPost
        let processedTags = [];
        if (tags) {
          if (Array.isArray(tags)) {
            processedTags = tags.filter(tag => 
              typeof tag === 'string' && 
              tag.trim().length > 0 && 
              tag.trim().length <= 50
            ).map(tag => tag.trim().toLowerCase());
          } else if (typeof tags === 'string') {
            processedTags = [tags.trim().toLowerCase()];
          }
          
          if (processedTags.length > 10) {
            return next(new ErrorHandler("Maximum 10 tags allowed", 400));
          }
        }

        const updateData = {
          title,
          content,
          tags: processedTags,
          updatedAt: new Date()
        };

        // Handle cover image update if provided
        if (req.file) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new ErrorHandler("Invalid file type. Only images are allowed", 400));
          }
          updateData.cover_image_url = req.file.path;
        }

        const updatedPost = await Post.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).populate("owner", "name profile_image_url");

        res.json({
          success: true,
          message: "Post updated successfully",
          post: updatedPost
        });
      } catch (error) {
        next(new ErrorHandler("Error updating post", 500));
      }
    });
  });
});

// Comment on Post - REQUIRES AUTHENTICATION
export const commentPost = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }
  
  // Validate comment text
  if (!text || text.trim().length === 0) {
    return next(new ErrorHandler("Comment text is required", 400));
  }
  
  if (text.trim().length > 1000) {
    return next(new ErrorHandler("Comment must be less than 1000 characters", 400));
  }

  const post = await Post.findById(id);
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const comment = {
    user: req.user._id,
    text: text.trim(),
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  // Populate the user info for the new comment
  await post.populate("comments.user", "name profile_image_url");

  res.json({
    success: true,
    message: "Comment added successfully",
    comments_count: post.comments.length,
    comment: post.comments[post.comments.length - 1] // Return the newly added comment
  });
});

// Like/Unlike Post - REQUIRES AUTHENTICATION
export const likePost = AsyncError(async (req, res, next) => {
  console.log("Like/Unlike post request");
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  const post = await Post.findById(id);
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const userId = req.user._id.toString();
  const index = post.likes.findIndex((id) => id.toString() === userId);

  let isLiked = false;
  if (index === -1) {
    // Like the post
    post.likes.push(userId);
    post.likes_count += 1;
    isLiked = true;
  } else {
    // Unlike the post
    post.likes.splice(index, 1);
    post.likes_count -= 1;
    isLiked = false;
  }

  await post.save();

  res.json({
    success: true,
    likes_count: post.likes_count,
    isLiked,
  });
});

// Get Posts by Tag - PUBLIC
export const getPostsByTag = AsyncError(async (req, res, next) => {
  console.log("Get posts by tag route is called");
  const { tag, page = 1, limit = 10 } = req.query;
  
  if (!tag) {
    return next(new ErrorHandler("Tag query parameter is required", 400));
  }

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
    return next(new ErrorHandler("Invalid pagination parameters", 400));
  }

  const skip = (pageNum - 1) * limitNum;

  // Sanitize tag
  const sanitizedTag = tag.trim().toLowerCase();
  
  const posts = await Post.find({ 
    tags: sanitizedTag
    // Remove status filter if you don't have a status field
    // status: 'published' 
  })
  .populate("owner", "name profile_image_url")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limitNum)
  .lean();

  // Get total count for pagination
  const totalPosts = await Post.countDocuments({ 
    tags: sanitizedTag
    // status: 'published' 
  });

  res.json({
    success: true,
    message: "Posts fetched successfully",
    posts,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum),
      totalPosts,
      hasNext: pageNum < Math.ceil(totalPosts / limitNum),
      hasPrev: pageNum > 1
    }
  });
});