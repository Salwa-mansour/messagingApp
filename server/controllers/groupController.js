import * as messageService from '../services/messageService.js';
import * as groupService from '../services/groupService.js';

export const createGroup = async (req, res) => {
  const { name, userIds } = req.body;
  const creatorId = req.user.userId; // 💡 Extracted securely from your JWT auth middleware token

  // 1. Validation: Verify the input exists and is an array
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Group name is required." });
  }

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ message: "Invalid members list layout provided." });
  }

  // 2. Strict Validation: Check that at least 2 distinct external keys were sent
  if (userIds.length < 2) {
    return res.status(400).json({ message: "A multi-member group channel requires at least 2 selected users." });
  }

  try {
    // 💡 AUTOMATIC CREATOR INCLUSION: Combine selected users array with the creator's ID
    // Using Set prevents duplicating the creator's ID if they were accidentally passed in userIds
    const completeMemberArray = [...new Set([...userIds, creatorId])];

    // 3. Persist transaction to Prisma
    const newGroup = await groupService.createGroup(name, completeMemberArray);

    return res.status(201).json(newGroup);
  } catch (error) {
    console.error("Group Creation Error:", error);
    return res.status(500).json({ message: "Failed to create group channel structure." });
  }
};

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