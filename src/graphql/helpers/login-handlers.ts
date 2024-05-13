import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

export function generateToken(user: UserToken): string {
  const payload = {
    id: user.id,
    email: user.email
  };

  const options = {
    expiresIn: "1h"
  };

  const secret = process.env.JWT_SECRET ?? "mysupersecret";

  return jwt.sign(payload, secret, options);
}
