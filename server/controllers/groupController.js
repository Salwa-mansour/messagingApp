import * as messageService from '../services/messageService.js';
import * as groupService from '../services/groupService.js';

export const createGroup = async (req, res) => {
  const { name, userIds } = req.body;
  const creatorId = req.user.userId;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Group name is required." });
  }

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ message: "Invalid members list layout provided." });
  }

  if (userIds.length < 2) {
    return res.status(400).json({ message: "A multi-member group channel requires at least 2 selected users." });
  }

  try {
    const completeMemberArray = [...new Set([...userIds, creatorId])];

    // 1. Persist the group to Prisma
    const newGroup = await groupService.createGroup(name, completeMemberArray);

    // 2. Grab the WebSocket server instance
    const io = req.app.get("io");

    if (io) {
      // 3. Emit the event to each user included in the group
      newGroup.users.forEach((user) => {
        io.to(user.id).emit("group_created", newGroup);
      });
    }

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