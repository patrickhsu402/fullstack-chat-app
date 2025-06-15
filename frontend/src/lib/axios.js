import axios from "axios";

// This allows you to make requests to the backend API without repeating the base URL each time
// The base URL is set to "http://localhost:5001/api", which is where the backend server is expected to run
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    withCredentials: true // This allows cookies to be sent with requests, which is useful for authentication
});