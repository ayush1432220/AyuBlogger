import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReadMorePage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/post/${id}`);
        setPost(res.data.post);

        // fetch related posts (based on tags or category)
        if (res.data.post?.tags?.length > 0) {
          const tag = res.data.post.tags[0];
          const relatedRes = await API.get(`/post?tag=${tag}`);
          setRelated(relatedRes.data.posts.filter(p => p._id !== id));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load realated post.");
      }
    };
    fetchData();
  }, [id]);

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 animate-gradient-pan">
        <p className="text-indigo-700 font-semibold text-lg animate-fade-in-up">
          Loading...
        </p>
      </div>
    );

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          0% {opacity:0; transform: translateY(10px);}
          100% {opacity:1; transform: translateY(0);}
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease forwards;
        }
        @keyframes gradient-pan {
          0%, 100% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
        }
        .animate-gradient-pan {
          background-size: 200% 200%;
          animation: gradient-pan 20s ease infinite;
        }
      `}</style>

      <div
        className="min-h-screen flex justify-center p-6 gap-6
          bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200
          animate-gradient-pan
          font-sans
          overflow-y-auto scroll-smooth"
      >
        {/* LEFT SIDE - Main Post */}
        <article
          className="w-full md:w-2/3 bg-white/30 backdrop-blur-xl border border-white/30
            rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300
            animate-fade-in-up"
        >
          <img
            src={post.cover_image_url || "/placeholder.jpg"}
            alt={post.title || "Post image"}
            className="h-56 w-full object-cover rounded-t-2xl hover:opacity-90 transition-opacity duration-300"
            loading="lazy"
          />
          <div className="px-8 py-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              {post.title || "Untitled Post"}
            </h1>
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              {post.content || "No content available."}
            </p>

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mb-6">
                {post.tags.map((tag, ind) => (
                  <span
                    key={ind}
                    className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-3 py-1 rounded-full select-none"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="text-indigo-700 font-medium space-y-1 text-sm mb-6 select-none">
              <p>❤️ Likes: {post.likes_count ?? 0}</p>
              <p>👁️ Views: {post.views_count ?? 0}</p>
              <p>💬 Comments: {post.comments_count ?? 0}</p>
            </div>

            <hr className="border-white/40 mb-6" />

            <div className="space-y-2 mb-6">
              {post.seo_title && (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    SEO Title:
                  </p>
                  <p className="text-gray-800">{post.seo_title}</p>
                </>
              )}

              {post.seo_description && (
                <>
                  <p className="text-lg font-semibold text-gray-900 mt-4">
                    Description:
                  </p>
                  <p className="text-gray-800">{post.seo_description}</p>
                </>
              )}

              {post.reading_time && (
                <p className="inline-block mt-4 text-indigo-800 bg-indigo-100 rounded-full px-3 py-1 text-sm font-semibold select-none">
                  Reading Time: {post.reading_time}
                </p>
              )}

              {post.owner?.name && (
                <p className="inline-block mt-4 text-indigo-800 bg-indigo-100 rounded-full px-3 py-1 text-sm font-semibold select-none">
                  Owner: {post.owner.name}
                </p>
              )}
            </div>
          </div>
        </article>

        {/* RIGHT SIDE - Related Posts */}
        <aside
          className="hidden md:block w-1/3 space-y-4 overflow-y-auto max-h-[95vh] p-2"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Posts</h2>
          {related.length > 0 ? (
            related.map((item) => (
              <Link
                key={item._id}
                to={`/post/${item._id}`}
                className="block bg-white/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={item.cover_image_url || "/placeholder.jpg"}
                  alt={item.title}
                  className="h-32 w-full object-cover"
                />
                <div className="p-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-700 italic">No related posts found.</p>
          )}
        </aside>
      </div>
    </>
  );
}

export default ReadMorePage;
