import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData);
    return response.data;
};

export const getFiles = async () => {
    const response = await axios.get(`${API_URL}/files`);
    return response.data;
};

export const downloadFile = async (id) => {
    const response = await axios.get(`${API_URL}/files/${id}`, {
        responseType: 'blob'
    });
    return response.data;
};

export const deleteFile = async (id) => {
    const response = await axios.delete(`${API_URL}/files/${id}`);
    return response.data;
};
