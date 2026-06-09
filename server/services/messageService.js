import prisma from '../data/connection.js';

/**
 * Creates and saves a brand new message to the database
 */
export const getMessagesByGroupId = async (groupId) => {
  return await prisma.message.findMany({
    where: { groupId },
    orderBy: { createdAt: 'asc' }, // Oldest messages first
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
};
export const createMessage = async (content, senderId, groupId) => {
  return await prisma.message.create({
    data: {
      content,
      senderId,
      groupId
    },
    // Include the sender's details so the API instantly returns who wrote it
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
};