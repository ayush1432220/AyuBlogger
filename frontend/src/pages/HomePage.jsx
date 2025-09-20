import React, { useEffect, useState } from "react";
import API from "../api";
import Card from "../Components/Card.jsx";
import Navbar from "../Components/Navbar.jsx";
import toast from "react-hot-toast";

function HomePage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await API.get("/"); 
        setCards(res.data.posts || res.data.post);
        toast.success("Posts loaded successfully ", { id: "fetchPosts" });
      } catch (err) {
        console.error("Error fetching data", err);
        toast.error("Failed to load posts ", { id: "fetchPosts" });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mt-6 min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-[1400px] mx-auto">
          {cards.map((card) => (
            <Card card={card} key={card._id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;