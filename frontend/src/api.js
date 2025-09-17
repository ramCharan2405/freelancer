import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5174";

export const fetchProjects = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/projects`);
        return response.data;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
};