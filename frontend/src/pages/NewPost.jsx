import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = import.meta.env.VITE_API_URL;

function AddPost() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cover_image_url: "",
    tags: "",
    seo_title: "",
    seo_description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          dataToSend.append(key, formData[key]);
        }
      });

      if (imageFile) {
        dataToSend.append("image", imageFile);
      }

      if (!formData.seo_title) dataToSend.append("seo_title", formData.title);
      if (!formData.seo_description)
        dataToSend.append(
          "seo_description",
          formData.content.slice(0, 150) + "..."
        );

      if (formData.tags) {
        const cleanTags = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        dataToSend.set("tags", cleanTags.join(","));
      }

      await axios.post(`${api}/post/new`, dataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Post created successfully!", {
        position: "top-right",
        theme: "colored",
      });

      setFormData({
        title: "",
        content: "",
        cover_image_url: "",
        tags: "",
        seo_title: "",
        seo_description: "",
      });
      setImageFile(null);
      setPreviewUrl("");
      navigate("/");
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error("Failed to create post", {
        position: "top-right",
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-2xl w-full border border-gray-200 hover:shadow-2xl transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
           Create New Post
        </h2>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter post title"
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="5"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Write your post content..."
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer"
          />
        </div>

        {previewUrl && (
          <div className="mb-5">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-lg shadow-lg w-full h-48 object-cover border border-gray-200"
            />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., tech, javascript, react"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">
            SEO Title
          </label>
          <input
            type="text"
            name="seo_title"
            value={formData.seo_title}
            onChange={handleChange}
            placeholder="Enter SEO title (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-1">
            SEO Description
          </label>
          <textarea
            name="seo_description"
            value={formData.seo_description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter SEO description... (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 text-lg"
        >
          {loading ? " Posting..." : "Add Post"}
        </button>
      </form>
    </div>
  );
}

export default AddPost;
