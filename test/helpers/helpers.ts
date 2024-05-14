import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  email: string;
}

export function verifyToken(token: string): TokenPayload {
  try {
    const secret = process.env.JWT_SECRET ?? "mysupersecret";
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
