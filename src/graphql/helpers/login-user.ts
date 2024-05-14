import { prisma } from "../../setup-db";
import { CustomError } from "./error-handlers";
import bcrypt from "bcrypt";

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
