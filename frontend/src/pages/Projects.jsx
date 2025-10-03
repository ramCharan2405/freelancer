import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const userModel = localStorage.getItem("userModel");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/freelancerprojects/",
          {
            withCredentials: true,
          }
        );
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let updatedProjects = projects.filter((project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterCategory) {
      updatedProjects = updatedProjects.filter((project) =>
        project.categories.includes(filterCategory)
      );
    }

    if (sort === "asc") {
      updatedProjects.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      updatedProjects.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      updatedProjects.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredProjects(updatedProjects);
  }, [searchTerm, filterCategory, sort, projects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      {}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-green-700 mb-2">
          Projects
        </h1>
        <p className="text-lg text-green-900 max-w-2xl mx-auto">
          Everything you need to know to grow your business...
        </p>
      </div>

      {}
      <div className="flex flex-wrap justify-between items-center gap-6 mb-10 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100 px-6 py-6">
        {}
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400">
            <FaSearch />
          </span>
        </div>
        {}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-base font-semibold text-green-700">
            Filter:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-green-200 rounded-xl bg-white text-green-700 shadow focus:outline-none focus:border-green-500 transition"
          >
            <option value="">All Categories</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-base font-semibold text-green-700">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-green-200 rounded-xl bg-white text-green-700 shadow focus:outline-none focus:border-green-500 transition"
          >
            <option value="newest">Newest</option>
            <option value="asc">Price (Low to High)</option>
            <option value="desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {}
      <div className="flex items-center justify-center min-h-[300px] bg-white/80 rounded-2xl shadow-lg border border-green-100 mt-8">
        <h1 className="text-2xl font-bold text-green-700">
          🚧 Projects Page in Development 🚧
        </h1>
      </div>
    </div>
  );
};

export default Projects;
