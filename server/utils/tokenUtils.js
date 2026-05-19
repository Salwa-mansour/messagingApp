import jwt from 'jsonwebtoken';

/**
 * Generates both Access and Refresh tokens for a user
 * @param {Object} user - The user object containing id, username, and email
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokens = (user) => {
  // 1. Define the lightweight payload for the short-lived access token
  const tokenPayload = { 
    userId: user.id, 
    username: user.username 
  };

  // 2. Sign the Access Token (Expires in 15 minutes)
  const accessToken = jwt.sign(
    tokenPayload,
    process.env.ACCESS_TOKEN_SECRET ,
    { expiresIn: '15m' }
  );

  // 3. Sign the Refresh Token (Expires in 7 days)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET ,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};