import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js"; 
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import { Post } from "./models/post.js";
import { errorMiddleware } from "./middlewares/error.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
const dbURL = process.env.DBURL;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",   
  "https://ayu-blogger.vercel.app",  
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(dbURL).then(() => {
  console.log("MongoDB connected");
});

app.get("/", async (req, res) => {
  const post = await Post.find({});
  res.json({
    message: "These are the posts",
    post,
  });
});

app.use("/user", userRoutes); 
app.use("/post", postRoutes);

app.listen(port, () => {
  console.log("Server is running on " + port);
});

app.use(errorMiddleware);
