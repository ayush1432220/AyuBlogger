import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api"; 

function UserEditForm() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    profile_pic: null,
    existing_pic_url: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/user/me", { withCredentials: true });

        if (data.success && data.user) {
          setForm({
            name: data.user.name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            profile_pic: null,
            existing_pic_url: data.user.profile_image_url || "",
          });
          toast.success("User data loaded");
        } else {
          toast.error("Failed to load user data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("bio", form.bio);
    if (form.profile_pic) {
      formData.append("profile_pic", form.profile_pic);
    }

    try {
      const { data } = await API.post("/user/edit", formData, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Profile updated! Redirecting...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center
        bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
        p-4 font-sans bg-[length:200%_200%] animate-gradient-pan
        overflow-y-auto scroll-smooth"
    >
      <div
        className="w-full max-w-md p-8 space-y-8 rounded-2xl 
          bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20"
      >
        <h1 className="text-3xl font-bold text-center text-white mb-8 tracking-wider">
          Edit Profile
        </h1>

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-5 py-3 rounded-lg bg-white/20 text-white placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/30
              transition-all duration-300 animate-fade-in-up"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-5 py-3 rounded-lg bg-white/20 text-white placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/30
              transition-all duration-300 animate-fade-in-up"
            required
          />

          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-5 py-3 rounded-lg bg-white/20 text-white placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/30
              transition-all duration-300 animate-fade-in-up"
          ></textarea>

          {form.existing_pic_url && (
            <div className="text-center">
              <img
                src={form.existing_pic_url}
                alt="Current Profile"
                className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-white/30"
              />
              <p className="text-white/80 text-sm">Current Profile Picture</p>
            </div>
          )}

          <input
            type="file"
            name="profile_pic"
            onChange={(e) =>
              setForm({ ...form, profile_pic: e.target.files[0] })
            }
            className="w-full px-5 py-3 rounded-lg bg-white/20 text-white placeholder-white/70
              file:bg-pink-500 file:text-white file:border-none file:px-4 file:py-2
              file:rounded-lg file:cursor-pointer hover:file:bg-pink-600
              focus:outline-none focus:ring-2 focus:ring-pink-400
              transition-all duration-300 animate-fade-in-up"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-pink-500 text-white font-semibold
              hover:bg-pink-600 transition-all duration-300 animate-fade-in-up"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserEditForm;
