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
      throw new CustomError(400, "Wrong password and/or email");
    } else {
      return user;
    }
  } else {
    throw new CustomError(400, `User with email ${email} not found`);
  }
}

export function generateToken(id: number): string {
  const payload = {
    id
  };

  const options = {
    expiresIn: "1h"
  };

  const secret = process.env.JWT_SECRET ?? "mysupersecret";

  return jwt.sign(payload, secret, options);
}
