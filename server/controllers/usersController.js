import * as usersService from '../services/usersService.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers();  
    return res.status(200).json(users);
  }
    catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(400).json({ message: 'Failed to retrieve users.' });
    }
}