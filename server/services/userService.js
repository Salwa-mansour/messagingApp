import prisma from '../data/connection.js';

/**
 * Finds a user by their email or username
 */
export const findUserByEmailOrUsername = async (email, username) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { username: username }
      ]
    }
  });
};

/**
 * Finds the global default chat room
 */
export const findDefaultGroup = async () => {
  return await prisma.group.findFirst({
    where: { isDefault: true }
  });
};

/**
 * Fallback: Creates the global default chat room if missing
 */
export const createDefaultGroup = async () => {
  return await prisma.group.create({
    data: {
      name: 'General Chat Room',
      isDefault: true
    }
  });
};

/**
 * Creates a new user and automatically joins them to a group
 */
export const createUserWithGroup = async (username, email, hashedPassword, groupId) => {
  return await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      groups: {
        connect: { id: groupId }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true
    }
  });
};

/**
 * Finds a user explicitly by email to verify credentials
 */
export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

/**
 * Updates a user's stored refresh token string
 */
export const updateUserRefreshToken = async (userId, token) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: token }
  });
};
export const findUserByRefreshToken = async (token) => {
  return await prisma.user.findFirst({
    where: { refreshToken: token }
  });
};

export const clearUserRefreshToken = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null } // Erases it completely from the record
  });
}