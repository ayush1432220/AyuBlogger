import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function UserProfile() {
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resUser = await API.get("/user/me", { withCredentials: true });
        setUserData(resUser.data.user);

        const userId = resUser.data.user._id;
        const resPosts = await API.get(`/post/user/me/${userId}`, {
          withCredentials: true,
        });

        setPosts(resPosts.data.posts || []);
        toast.success("User data loaded successfully!");
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load user data!");
      }
    };
    fetchUserData();
  }, []);

  const logoutHandler = async () => {
    try {
      await API.get("/user/logout", { withCredentials: true });
      toast.success("Logged out successfully!");
      navigate("/user/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed!");
    }
  };

  const editHandler = () => {
    navigate("/user/edit");
  };

  const editPost = (postId) => {
    navigate(`/post/edit/${postId}`);
  };

  const deletePost = (postId) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this post?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await API.delete(`/post/${postId}`, { withCredentials: true });
              setPosts((prevPosts) =>
                prevPosts.filter((post) => post._id !== postId)
              );
              toast.success("Post deleted successfully!");
            } catch (err) {
              console.error("Error deleting post:", err);
              toast.error("Failed to delete post!");
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            toast.info("Delete cancelled");
          },
        },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-shadow duration-300 self-start sticky top-6">
          <div className="flex justify-center mb-4">
            <img
              src={userData.profile_image_url || "/user.png"}
              alt={userData.name ? `${userData.name}'s avatar` : "User Avatar"}
              onError={(e) => (e.target.src = "/user.png")} 
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-300 shadow-md"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {userData.name}
          </h2>
          <p className="text-sm text-gray-500 capitalize">
            {userData.role || "User"}
          </p>
          <p className="mt-3 text-gray-600">📧 {userData.email}</p>
          <p className="mt-2 text-gray-700 italic">
            {userData.bio || "No bio available"}
          </p>
          <p
            className={`mt-3 font-semibold ${
              userData.accountVerified ? "text-green-600" : "text-red-500"
            }`}
          >
            {userData.accountVerified
              ? "✔ Account Verified"
              : "✖ Account Not Verified"}
          </p>
          {userData.createdAt && (
            <p className="mt-1 text-gray-500 text-sm">
              Member Since {new Date(userData.createdAt).getFullYear()}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={editHandler}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow hover:opacity-90 transition"
            >
              Edit Profile
            </button>
            <button
              onClick={logoutHandler}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Posts</h2>
          {posts.length > 0 ? (
            <div className="grid gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="rounded-lg w-full h-56 object-cover mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => editPost(post._id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-lg italic">
              You have not posted anything yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
