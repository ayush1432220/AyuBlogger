import express from "express";
import passport from "passport";
import {
  register,
  verifyOTP,
  login,
  logout,
  getUser,
  editUser,
  googleAuthLogin,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import multer from "multer";
import { storage } from "../cloudConfig.js";

const upload = multer({ storage });
const router = express.Router();

router.post("/signup", register);
router.post("/verify", verifyOTP);
router.post("/login", login);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/",
  }),
  googleAuthLogin
);

router.get("/logout", isLoggedIn, logout);
router.get("/me", isLoggedIn, getUser);
router.post("/edit", isLoggedIn, upload.single("profile_pic"), editUser);

export default router;
