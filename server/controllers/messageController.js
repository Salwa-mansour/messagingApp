import * as messageService from '../services/messageService.js';
import * as groupService from '../services/groupService.js';

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
  const { groupId, recipientId } = req.query; // Accept either groupId or recipientId as query parameters
  const { content } = req.body;
  const senderId = req.user.userId; // Provided by your auth bouncer middleware

  // 1. Validation
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content cannot be empty.' });
  }

  if (!groupId && !recipientId) {
    return res.status(400).json({ message: 'Must provide either a groupId or a recipientId.' });
  }

  try {
    let targetGroupId = groupId;

    // 2. If there is no groupId, it's a DM. Run the Find-or-Create sequence!
    if (!targetGroupId && recipientId) {
      // Prevent users from starting a DM with themselves
      if (senderId === recipientId) {
        return res.status(400).json({ message: 'You cannot start a direct message thread with yourself.' });
      }

      const dmGroup = await groupService.findOrCreateDMGroup(senderId, recipientId);
      targetGroupId = dmGroup.id; // Assign the newly found/created group ID
    }

    // 3. Save the message using the resolved group ID
    const newMessage = await messageService.createMessage(content, senderId, targetGroupId);

    // 4. Return the message along with the target group identifier
    return res.status(201).json({
      message: 'Message sent successfully!',
      groupId: targetGroupId, // React needs this to know which room history to update
      data: newMessage
    });

  } catch (error) {
    console.error('Send Message Error:', error);
    return res.status(500).json({ message: 'Failed to process and send message.' });
  }
};