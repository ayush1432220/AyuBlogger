import { FaHeart, FaRegComment, FaPaperPlane, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../api";

function Card({ card }) {

  const [likes, setLikes] = useState(card.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(card.comments || []);


  useEffect(() => {
    checkIfLiked();
  }, [card._id]);

  const checkIfLiked = async () => {
    try {
      if (card.likes && Array.isArray(card.likes)) {
        const userResponse = await API.get("/user/me");
        const currentUserId = userResponse.data.user._id;
        
        const userHasLiked = card.likes.some(like => 
          like._id ? like._id.toString() === currentUserId : like.toString() === currentUserId
        );
        
        setIsLiked(userHasLiked);
      }
    } catch (err) {
      console.error("Error checking like status:", err);
      if (card.isLiked !== undefined) {
        setIsLiked(card.isLiked);
      }
    }
  };


  const handleLike = async (postId) => {
    try {
      const res = await API.post(`/post/${postId}/like`, {});
      
      setLikes(res.data.likes_count);
      setIsLiked(res.data.isLiked);
      toast.success(res.data.isLiked ? "Post liked" : "Post unliked");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Please login to like posts");
      } else {
        toast.error("Failed to like post");
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      const res = await API.post(`/post/${postId}/comment`, { 
        text: commentText 
      });
      
      setComments([...comments, res.data.comment]);
      setCommentText("");
      toast.success("Comment added successfully");
    } catch (err) {
      console.error("Error adding comment", err);
      if (err.response?.status === 401) {
        toast.error("Please login to comment");
      } else {
        toast.error("Failed to add comment");
      }
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex flex-col bg-white/20 backdrop-blur-xl 
                 rounded-3xl border border-white/30 shadow-lg overflow-hidden 
                 hover:shadow-2xl hover:border-purple-400/50 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden">
        <motion.img
          src={card.cover_image_url}
          alt={card.title}
          loading="lazy"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-3 right-3 bg-white/90 text-xs px-3 py-1 rounded-full shadow-md text-gray-700 font-medium">
          {card.category || "General"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 line-clamp-2">
          {card.title}
        </h3>
        <p className="text-gray-700 text-sm flex-grow line-clamp-3">
          {card.content}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between text-gray-600">
          <div className="flex gap-6">
            {/* Like Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleLike(card._id)}
              className={`flex items-center gap-2 font-medium transition-all ${
                isLiked
                  ? "text-red-500"
                  : "hover:text-red-500 text-gray-700"
              }`}
            >
              <FaHeart size={20} className="drop-shadow-sm" />
              <span className="text-sm">{likes}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors ${
                showComments ? "text-blue-500" : "hover:text-blue-500"
              }`}
            >
              <FaRegComment size={20} />
              <span className="text-sm">{comments.length || 0}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ rotate: -20, scale: 0.9 }}
              className="flex items-center gap-2 hover:text-green-500 transition-colors"
            >
              <FaPaperPlane size={20} />
            </motion.button>
          </div>
          <span className="text-xs text-gray-500">👁 {card.views_count}</span>
        </div>

        {/* Read More */}
        <Link
          to={`/post/${card._id}`}
          className="mt-5 inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500 
                     text-white font-semibold py-2.5 px-6 rounded-xl shadow-md 
                     transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          Read More →
        </Link>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm border-t border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-purple-700">
                  Comments ({comments.length})
                </h4>
                <button 
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              
              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id || comment.createdAt} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-indigo-600 text-sm">
                          {comment.user?.name || "User"}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                )}
              </div>
              
              {/* Add Comment Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border rounded-lg text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddComment(card._id);
                  }}
                />
                <button
                  onClick={() => handleAddComment(card._id)}
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default Card;