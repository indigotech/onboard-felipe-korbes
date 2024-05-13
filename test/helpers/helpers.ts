import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): TokenPayload {
  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
