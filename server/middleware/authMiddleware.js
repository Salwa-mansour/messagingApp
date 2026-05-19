import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // 1. Grab the Authorization header string
  const authHeader = req.headers['authorization'];
  
  // Headers usually look like: "Bearer eyJhbGciOiJIUzI1Ni..."
  // We split by the space and grab the second element (the token string)
  const token = authHeader && authHeader.split(' ')[1];

  // If there is no token at all, stop them immediately
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // 2. Verify the token signature using your access secret
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
    if (err) {
      // Token exists but is either expired or tampered with
      return res.status(403).json({ message: 'Invalid or expired access token.' });
    }

    // 3. Attach the decoded user payload data directly to the request object
    req.user = decodedUser; 

    // 4. Let them pass to the next destination (the controller)
    next(); 
  });
};