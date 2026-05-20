import prisma from '../data/connection.js';

/**
 * Finds an existing DM group between two specific users, 
 * or creates a brand new one if it doesn't exist.
 */
export const findOrCreateDMGroup = async (userAId, userBId) => {
  // 1. Look for an existing DM group that contains BOTH user IDs
  const existingGroup = await prisma.group.findFirst({
    where: {
      isDM: true,
      AND: [
        { users: { some: { userId: userAId } } },
        { users: { some: { userId: userBId } } }
      ]
    }
  });

  if (existingGroup) {
    return existingGroup; // Found it! Return the existing group context
  }

  // 2. If not found, create a brand new DM group and link both users simultaneously
  return await prisma.group.create({
    data: {
      isDM: true,
      users: {
        create: [
          { userId: userAId },
          { userId: userBId }
        ]
      }
    }
  });
};