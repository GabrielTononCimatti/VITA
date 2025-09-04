import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001", // A URL do seu json-server
});

export default api;
