import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../setup-db";
import { CustomError } from "./error-handlers";

export async function loginUser(email: string, plaintextPassword: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (user?.email) {
    const match = await bcrypt.compare(plaintextPassword, user.password);

    if (!match) {
      throw new CustomError(400, "Senha e/ou email incorretos");
    } else {
      return user;
    }
  } else {
    throw new CustomError(400, `Usuário com email ${email} não encontrado`);
  }
}

interface UserToken {
  id: number;
  name: string;
  email: string;
  birthDate: string | null;
}

export const longExpiration = "604800";
export const shortExpiration = "3600";
export function generateToken(id: number, rememberMe: boolean): string {
  const expiration = rememberMe ? longExpiration + "s" : shortExpiration + "s";

  const payload = {
    id: id
  };

  const options = {
    expiresIn: expiration
  };

  const secret = process.env.JWT_SECRET as string;

  return jwt.sign(payload, secret, options);
}
