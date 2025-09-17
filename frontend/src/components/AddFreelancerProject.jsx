import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: "",
    authorName: "",
    authorProfileImage: "",
    rating: "",
    price: "",
    imageUrl: "",
    budget: "",
    technologies: "",
    status: "open",
    company: "", // Optional: Fill in if needed
    freelancer: "", // Optional: Fill in if needed
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categories: formData.categories.split(",").map((c) => c.trim()),
        author: {
          name: formData.authorName,
          profileImage: formData.authorProfileImage,
        },
        rating: parseFloat(formData.rating || 0),
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        budget: parseFloat(formData.budget || 0),
        technologies: formData.technologies
          .split(",")
          .map((tech) => tech.trim()),
        status: formData.status,
        company: formData.company || undefined,
        freelancer: formData.freelancer || undefined,
      };

      await axios.post(
        "http://localhost:8000/api/freelancerprojects/createProject",
        payload,
        {
          withCredentials: true,
        }
      );
      navigate("/projects");
      
    } catch (err) {
      navigate("/projects");
      console.error("Failed to add project:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Add New Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
            placeholder="Project title"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            onChange={handleChange}
            required
            rows={4}
            className="w-full border px-4 py-2 rounded"
            placeholder="Project description"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Categories</label>
          <input
            type="text"
            name="categories"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            placeholder="e.g. Design, Development"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Technologies</label>
          <input
            type="text"
            name="technologies"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            placeholder="e.g. React, Node, MongoDB"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Author Name</label>
            <input
              type="text"
              name="authorName"
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Author Image URL</label>
            <input
              type="text"
              name="authorProfileImage"
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              placeholder="https://example.com/profile.jpg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Price</label>
            <input
              type="number"
              name="price"
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
          </div>
          {/* <div>
            <label className="block mb-1 font-semibold">Budget (Optional)</label>
            <input
              type="number"
              name="budget"
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div> */}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
            placeholder="Main preview image URL"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="block mb-1 font-semibold">Rating</label>
            <input
              type="number"
              name="rating"
              onChange={handleChange}
              max={5}
              step={0.1}
              className="w-full border px-4 py-2 rounded"
              placeholder="0 - 5"
            />
          </div> */}
          {/* <div>
            <label className="block mb-1 font-semibold">Status</label>
            <select
              name="status"
              onChange={handleChange}
              value={formData.status}
              className="w-full border px-4 py-2 rounded"
            >
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div> */}
        </div>

        {/* Optional: Company & Freelancer IDs */}
        {/* 
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Company ID</label>
            <input
              type="text"
              name="company"
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Freelancer ID</label>
            <input
              type="text"
              name="freelancer"
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>
        </div>
        */}

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
