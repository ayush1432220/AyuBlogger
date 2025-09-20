// import { Router } from "express";
// const router = Router();

// import {
//   deletePost,
//   editPost,
//   newPost,
//   showPost,
//   userPosts,
//   likePost,
//   commentPost,
//   getPostsByTag
// } from "../controllers/post.controller.js";
// import { 
//   isAuthenticated, 
//   optionalAuth, 
//   authorize, 
//   isAdmin, 
//   rateLimit, 
//   ipRateLimit 
// } from '../middlewares/auth.js';
// import { isLoggedIn } from "../middlewares/isLoggedIn.js";
// import multer from "multer";
// import { storage } from "../cloudConfig.js";
// const upload = multer({ storage });

// router.get("/:id", showPost);
// router.post("/new", isLoggedIn, upload.single("image"), newPost);
// router.get(
//   "/user/me/:id",
//   (req, res, next) => {
//     console.log(`psots route is called`);
//     next();
//   },
//   isLoggedIn,
//   userPosts
// );
// router.put("/:id", isLoggedIn, editPost);
// router.delete("/:id", isLoggedIn, deletePost);
// router.post(
//   "/:id/like",
//   (req, res, next) => {
//     console.log(`comment route is called`);
//     next();
//   },
//   isLoggedIn,
//   likePost
// );
// router.post(
//   "/:id/comment",
//   (req, res, next) => {
//     console.log(`comment route is called`);
//     next();
//   },
//   isLoggedIn,
//   commentPost
// );
// router.get("/",getPostsByTag)

// export default router;
 import { Router } from "express";
const router = Router();

import {
  deletePost,
  editPost,
  newPost,
  showPost,
  userPosts,
  likePost,
  commentPost,
  getPostsByTags,
  checkLikeStatus
} from "../controllers/post.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import multer from "multer";
import { storage } from "../cloudConfig.js";

const upload = multer({ storage });

router.get("/:id", showPost);
router.post("/new", isLoggedIn, upload.single("image"), newPost);
router.get("/user/me/:id", isLoggedIn, userPosts);
router.put("/:id", isLoggedIn, editPost);
router.delete("/:id", isLoggedIn, deletePost);
router.post("/:id/like", isLoggedIn, likePost);
router.post("/:id/comment", isLoggedIn, commentPost);
router.get("/", getPostsByTags);
router.get("/:id/check-like", isLoggedIn, checkLikeStatus);

export default router;
