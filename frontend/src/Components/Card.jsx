import { FaHeart, FaRegComment, FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
 
const api = import.meta.env.VITE_API_URL;
function Card({ card }) {
  const [likes, setLikes] = useState(card.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `${api}/post/${postId}/like`,
        {},
        { withCredentials: true }
      );
      setLikes(res.data.likes_count);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error(err);
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

            {/* Comment */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors"
            >
              <FaRegComment size={20} />
              <span className="text-sm">{card.comments_count || 0}</span>
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
    </motion.article>
  );
}

export default Card;
