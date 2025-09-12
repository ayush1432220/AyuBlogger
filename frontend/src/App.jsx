import React from "react";
import HomePage from "./pages/HomePage.jsx";
import { Routes, Route } from "react-router-dom";
import ReadMorePage from "./pages/ReadMorePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import NewPost from "./pages/NewPost.jsx";
import UserEditForm from "./pages/UserEditForm.jsx";
import EditPostForm from "./pages/EditPostForm.jsx";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<ReadMorePage />} />
        <Route path="/post/new" element={<NewPost />} />
        <Route path="/user/login" element={<LoginPage />} />
        <Route path="/user/signup" element={<SignUpPage />} />
        <Route path="/user/me" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/user/edit" element={<UserEditForm />} />
        <Route path="/post/edit/:id" element={<EditPostForm />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
