import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import {
  FiHome,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiChevronDown,
} from "react-icons/fi";
const api = import.meta.env.VITE_API_URL;

const Avatar = ({ src, name, size = "10" }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center w-${size} h-${size} overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 rounded-full ring-2 ring-white/50 shadow-md`}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <span className="font-bold text-lg text-white">{initial}</span>
      )}
    </div>
  );
};

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", profilePic: "",id:"" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // const fetchUser = async () => {
    //   try {
    //     const res = await API.get("/user/me", {
    //       withCredentials: true,
    //     });
    //     console.log(res.data.user._id);
    //     if (res.data && res.data.user.name) {
    //       setUser({
    //         name: res.data.user.name,
    //         profilePic: res.data.user.profile_image_url,
    //         id: res.data.user._id,
    //       });
    //       setIsLoggedIn(true);
    //     } else {
    //       setIsLoggedIn(false);
    //     }
    //   } catch (error) {
    //     console.error("Not authenticated or server error:", error);
    //     setIsLoggedIn(false);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    const fetchUser = async () => {
  try {
    const res = await API.get("/user/me");
    if (res.data && res.data.user) {
      setUser(res.data.user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  } catch (err) {
    setIsLoggedIn(false);
  } finally {
    setIsLoading(false);
  }
};

    fetchUser();
  }, []);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // const logoutHandler = async () => {
  //   try {
  //     await API.get("/user/logout", {
  //       withCredentials: true,
  //     });
  //     setIsLoggedIn(false);
  //     setUser({ name: "", profilePic: "" , id:"" });
  //     closeDropdown();
  //     navigate("/user/login");
  //   } catch (err) {
  //     console.error("Logout failed:", err);
  //   }
  // };
  const logoutHandler = async () => {
  try {
    await API.get("/user/logout");
    setIsLoggedIn(false);
    setUser({ name: "", profilePic: "", id: "" });
    navigate("/user/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};


  const viewProfileHandler = (id) => {
    console.log(`View profile Handler${id}`);
    closeDropdown();
    // navigate(`/user/me?id=${id}`); query String ka use krk id fetch krk data use location ka use krk niklta hai 
    navigate("/user/me")
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-lg border-b border-white/20 shadow-sm font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              AC
            </div>
            <span className="text-gray-800 font-bold text-2xl tracking-tight group-hover:text-purple-600 transition-colors">
              AyuBlogger
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* <Link
              to="/"
              className="hidden sm:flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 transition-colors"
            >
              <FiHome className="mr-2" /> Home
            </Link> */}

            {isLoading ? (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-24 h-8 bg-gray-300 rounded-md"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              </div>
            ) : isLoggedIn ? (
              <>
                <Link
                  to="/post/new"
                  className="hidden sm:flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 transition-colors"
                >
                  <FiPlusCircle className="mr-2" /> Add Post
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <Avatar src={user.profilePic} name={user.name} />
                    <span className="hidden md:block font-semibold text-gray-700">
                      {user.name}
                    </span>
                    <FiChevronDown
                      className={`hidden md:block text-gray-500 transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 origin-top-right transition-all duration-300 ease-in-out
                      ${
                        dropdownOpen
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          viewProfileHandler(user.id);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-500 hover:text-white transition-colors rounded-t-lg"
                      >
                        <FiUser className="mr-3" /> View Profile
                      </button>
                      <button
                        onClick={logoutHandler}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-500 hover:text-white transition-colors rounded-b-lg"
                      >
                        <FiLogOut className="mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/user/login">
                <button className="flex items-center px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-md transform hover:scale-105 transition-transform">
                  <FiLogIn className="mr-2" /> Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
