import prisma from '../data/connection.js';

/**
 * Finds an existing DM group between two specific users, 
 * or creates a brand new one if it doesn't exist.
 */
export const createGroup = async (name, memberIds) => {
  return await prisma.group.create({
    data: {
      name, 
      users: {
        connect: memberIds.map(id => ({ id })) // Connects all user IDs in one go
      }
    },
    include: {
      users: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
};

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

export const findOrCreateDMGroup = async (userAId, userB) => {
  // 1. Look for an existing DM group that contains BOTH user IDs
  const existingGroup = await findDMGroup(userAId, userB.id);

  if (existingGroup) {
    // Found it! Safely return the existing group with your flag attached
    return {
      ...existingGroup,
      isExists: true
    };
  }

  // 2. If not found, create a brand new DM group
  const newGroup = await prisma.group.create({
    data: {
      name: "Direct Message", // Neutral placeholder (frontend handles display name dynamically)
      isDM: true,
      users: {
        connect: [
          { id: userAId },
          { id: userB.id }
        ]
      }
    }
  });

  // Return the newly created group with the flag set to false
  return {
    ...newGroup,
    isExists: false
  };
};
export const getUserGroups = async (userId) => {
  if (!userId) return [];

 
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