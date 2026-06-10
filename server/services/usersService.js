import prisma from '../data/connection.js';

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
        id: true,
        username: true,
        
        }
    }); 
};