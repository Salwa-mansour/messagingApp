import * as messageService from '../services/messageService.js';
import * as groupService from '../services/groupService.js';

export const getUserGroups = async (req, res) => {
  const userId = req.user.userId; // Provided by your auth bouncer middleware   
 
    try {
        const groups = await groupService.getUserGroups(userId);
        return res.status(200).json(groups);
    } catch (error) {
        console.error('Get User Groups Error:', error);
        return res.status(400).json({ message: 'Failed to retrieve user groups.' });
    }   
};