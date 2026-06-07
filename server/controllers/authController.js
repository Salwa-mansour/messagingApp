import bcrypt from 'bcryptjs';
import * as userService from '../services/userService.js';
import { generateTokens } from '../utils/tokenUtils.js';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Verify user exists
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 2. Verify password match
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Generate Tokens
   const { accessToken, refreshToken } = generateTokens(user);

    // 4. Save refresh token to the database via service layer
    await userService.updateUserRefreshToken(user.id, refreshToken);

    // 5. Send Refresh Token in a secure HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      path: '/', 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    // 6. Send Access Token and non-sensitive user data back in JSON payload
    return res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error occurred during login.' });
  }
};

export const registerUser = async (req, res) => {

  const { username, email, password, confirmPassword } = req.body;

  // 2. Add it to your initial empty field check
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // 3. Compare them right here. If they don't match, stop immediately!
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // 4. Check if user already exists
    const existingUser = await userService.findUserByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username or Email is already taken.' });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Find or create the default chat room
    let defaultGroup = await userService.findDefaultGroup();
    if (!defaultGroup) {
      defaultGroup = await userService.createDefaultGroup();
    }

    // 7. Save to DB (Notice we ONLY pass password, never confirmPassword)
    const newUser = await userService.createUserWithGroup(
      username, 
      email, 
      hashedPassword, 
      defaultGroup.id
    );
    // ─── IMMEDIATE LOGIN SIGNING SYSTEM ──────────────────────────
    
    const { accessToken, refreshToken } = generateTokens(newUser);

    // 8. Save the refresh token string into the database
    await userService.updateUserRefreshToken(newUser.id, refreshToken);

    // 9. Bake the Refresh Token into the secure HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
       path: '/', 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

   // 10. Return success status with everything React needs to start the app session
    return res.status(201).json({
      message: 'User registered and logged in successfully!',
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error occurred.' });
  }
};

export const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  
  // 1. Look for the cookie payload
  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }

  const incomingRefreshToken = cookies.refreshToken;

  try {
    // 2. Fetch user matching the incoming token string
    const user = await userService.findUserByRefreshToken(incomingRefreshToken);
  
    if (!user) {
      return res.status(403).json({ message: 'Invalid or expired session token.' });
    }

    // 3. Verify token synchronously without raw tracking callbacks
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (jwtErr) {
      // Catch expired signatures or altered cryptographic data instantly
      console.error("JWT Verify Error:", jwtErr.message);
      return res.status(403).json({ message: 'Token verification failed.' });
    }

    // 4. Validate payload logic matching user database entry
    if (user.id !== decoded.userId) {
      return res.status(403).json({ message: 'Token ownership validation failed.' });
    }

    // ─── REFRESH TOKEN ROTATION ───────────────────────────
    // 5. Generate fresh tokens sequentially
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // 6. Persist rotation inside database safely
    await userService.updateUserRefreshToken(user.id, newRefreshToken);

    // 7. Re-issue fresh client-side cookie string layout
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      path: '/', 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // 8. Return data back to frontend hook safely
    return res.status(200).json({ 
      accessToken: newAccessToken,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('Refresh Token Controller Error:', error);
    return res.status(500).json({ message: 'Internal server error during session refresh.' });
  }
};
export const logoutUser = async (req, res) => {
  // 1. Grab the refresh token from cookies
  console.log('Logout Request Cookies:', req.cookies); // Debugging line to check incoming cookies
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    // If there's no cookie anyway, they are already logged out on the client side
    return res.sendStatus(204); // 204 No Content (Successful request, nothing to return)
  }

  const incomingRefreshToken = cookies.refreshToken;

  try {
    // 2. Find the user associated with this token string
    const user = await userService.findUserByRefreshToken(incomingRefreshToken);
    
    // If a matching user is found, wipe the database token entry
    if (user) {
      await userService.clearUserRefreshToken(user.id);
    }

    // 3. Clear the cookie from the client browser/Postman
    // The options object MUST perfectly match the configuration used when creating it!
    res.clearCookie('refreshToken', {
      httpOnly: true,
        path: '/', 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    return res.status(200).json({ message: 'Logged out successfully!' });

  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ message: 'Internal server error occurred during logout.' });
  }
};