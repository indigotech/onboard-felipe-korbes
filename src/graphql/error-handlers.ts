import { GraphQLFormattedError } from "graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import { prisma } from "../setup-db";
import bcrypt from "bcrypt";

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;
  constructor(code: number, message: string, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
  }
}

export const formatError = (formattedError: GraphQLFormattedError, error: unknown) => {
  const unwrappedError = unwrapResolverError(error);

  if (unwrappedError instanceof CustomError) {
    return {
      code: unwrappedError.code,
      message: unwrappedError.message,
      additionalInfo: unwrappedError.additionalInfo
    };
  } else {
    return {
      code: 400,
      message: "Something went wrong, try again",
      additionalInfo: null
    };
  }
};

export function passwordLenght(password: string): void {
  if (password.length < 6) {
    throw new CustomError(400, "Password must be at least 6 characters long");
  }
}

export function hasLettersAndNumbers(password: string): void {
  const lettersAndNumbers: boolean = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  if (!lettersAndNumbers) {
    throw new CustomError(400, "Password must contain at least one letter and one number");
  }
}

export function isValidDate(dateInput: string): void {
  const datePattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(\d{4})$/.test(dateInput);

  if (!datePattern) {
    throw new CustomError(400, "Invalid birth date. Birth date must be in the format DD-MM-YYYY");
  }
}

export function isValidYear(dateInput: string): void {
  const parts = dateInput.split("-");
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  const now = new Date();
  const currentYear = now.getFullYear();

  if (year < 1900 || year > currentYear) {
    throw new CustomError(400, "Invalid year. Year must be in the range 1900 - " + currentYear);
  }
}

export async function isValidEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (user?.email === email) {
    throw new CustomError(400, "Email already taken, please use a different email");
  }
}

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
