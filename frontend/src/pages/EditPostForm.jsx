import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; 
import toast from "react-hot-toast";

function EditPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cover_image_url: "",
    views_count: 0,
    tags: "",
    likes_count: 0,
    comments_count: 0,
    reading_time: "",
    seo_title: "",
    seo_description: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch post data for editing
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/post/${id}`);
        setFormData({
          title: data.post.title || "",
          content: data.post.content || "",
          cover_image_url: data.post.cover_image_url || "",
          views_count: data.post.views_count || 0,
          tags: data.post.tags?.join(", ") || "",
          likes_count: data.post.likes_count || 0,
          comments_count: data.post.comments_count || 0,
          reading_time: data.post.reading_time || "",
          seo_title: data.post.seo_title || "",
          seo_description: data.post.seo_description || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        toast.error(err.response?.data?.message || "Failed to fetch post");
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      };

      await api.put(`/post/${id}`, updatedData);
      toast.success("Post updated successfully 🎉");
      navigate(`/user/me`);
    } catch (err) {
      console.error("Failed to update post:", err);
      toast.error(err.response?.data?.message || "Failed to update post");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading post...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          ✏ Edit Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="5"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {formData.cover_image_url && (
            <div className="mt-2">
              <img
                src={formData.cover_image_url}
                alt="Preview"
                className="rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
          >
            Update Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostForm;
