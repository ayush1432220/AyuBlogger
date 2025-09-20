import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new Schema(
  {
    title:{
      type:String,
      required:true,
    } ,
    content:{
      type: String,
      required:true,
    } ,
    cover_image_url:{
      type:String,
    } ,
    views_count: {
      type: Number,
      default: 0,
    },
    tags: [String],

    likes_count: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    comments_count: {
      type: Number,
      default: 0,
    },

    reading_time: String,
    seo_title: String,
    seo_description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", postSchema);
