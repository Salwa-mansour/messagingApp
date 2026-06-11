import * as messageService from '../services/messageService.js';
import * as groupService from '../services/groupService.js';
import { findUserById } from '../services/authService.js';

export const getGroupMessages = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const messages = await messageService.getMessagesByGroupId(groupId);
    return res.status(200).json(messages);
  }
  catch (error) {
    console.error('Get Group Messages Error:', error);
    return res.status(400).json({ message: 'Failed to retrieve messages for the group.' });
  }
};


export const sendMessage = async (req, res) => {
  const { targetId } = req.params; // 💡 Now reads cleanly from the URL path directly
  const { content } = req.body;
  const senderId = req.user.userId;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content cannot be empty.' });
  }

  try {
    let targetGroupId = null;

    // Check if the targetId belongs to an existing group
    const existingGroup = await groupService.getGroupById(targetId);

    if (existingGroup) {
      // Scenario A: It's a Group Chat message!
      targetGroupId = existingGroup.id;
    } else {
      // Scenario B: It's a DM! Check if it's a valid recipient user
      if (senderId === targetId) {
        return res.status(400).json({ message: 'You cannot start a direct message thread with yourself.' });
      }

      const recipientUser = await findUserById(targetId);

      if (!recipientUser) {
        return res.status(404).json({ message: 'Target chat room or user could not be found.' });
      }

      // Run your Find-or-Create direct conversation sequence
      const dmGroup = await groupService.findOrCreateDMGroup(senderId, recipientUser);
      targetGroupId = dmGroup.id;
    }

    // Save the message
    const newMessage = await messageService.createMessage(content, senderId, targetGroupId);

    return res.status(201).json({
      message: 'Message sent successfully!',
      groupId: targetGroupId,
      data: newMessage
    });

  } catch (error) {
    console.error('Send Message Error:', error);
    return res.status(500).json({ message: 'Failed to process and send message.' });
  }
};