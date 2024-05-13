import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET ?? "secret";
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export interface AuthenticationData {
  user?: TokenPayload;
  isValidToken?: boolean;
}

export const context = async ({ req }: any): Promise<AuthenticationData> => {
  const token = req.headers.authorization || "";
  if (!token) {
    return {};
  }
  const user = verifyToken(token);

  if (!user) {
    return { isValidToken: false };
  }

  return { user, isValidToken: true };
};
