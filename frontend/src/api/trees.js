import api from './axios';

export const treesAPI = {
  // Get all trees for current user
  getAllTrees: async () => {
    const response = await api.get('/trees/');
    return response.data;
  },

  // Get specific tree
  getTree: async (treeId) => {
    const response = await api.get(`/trees/${treeId}/`);
    return response.data;
  },

  // Create new tree
  createTree: async (treeData) => {
    const response = await api.post('/trees/', treeData);
    return response.data;
  },

  // Update tree
  updateTree: async (treeId, treeData) => {
    const response = await api.put(`/trees/${treeId}/`, treeData);
    return response.data;
  },

  // Delete tree
  deleteTree: async (treeId) => {
    const response = await api.delete(`/trees/${treeId}/`);
    return response.data;
  },

  // Check card limit
  checkLimit: async (treeId) => {
    const response = await api.get(`/trees/${treeId}/check_limit/`);
    return response.data;
  },
};
