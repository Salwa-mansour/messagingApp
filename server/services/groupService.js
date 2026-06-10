import prisma from '../data/connection.js';

/**
 * Finds an existing DM group between two specific users, 
 * or creates a brand new one if it doesn't exist.
 */
export const getGroupById = async (groupId) => {
  return await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      users: {
        select: {
          id: true,
          username: true,
         
        }
      }
    }
  });
}



export const findDMGroup = async (userAId, userBId) => { 
  // Look for an existing DM group that contains BOTH user IDs
  return await prisma.group.findFirst({
    where: {
      isDM: true, // Double check your Schema has an 'isDM' field, it was missing from your schema dump!
      AND: [
        { users: { some: { id: userAId } } }, // ✅ Changed userId to id
        { users: { some: { id: userBId } } }  // ✅ Changed userId to id
      ]
    }
  });
};

export const findOrCreateDMGroup = async (userAId, userBId) => {
  // 1. Look for an existing DM group that contains BOTH user IDs
  const existingGroup = await findDMGroup(userAId, userBId);

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
export const getUserGroups = async (userId) => {
  if (!userId) return [];

  console.log(`Executing targeted database query for user: ${userId}`);

  return await prisma.group.findMany({
    where: {
      users: {
        some: {
          id: userId
        }
      }
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          status: true
        }
      }
    }
  });
};