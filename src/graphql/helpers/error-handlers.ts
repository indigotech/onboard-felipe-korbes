import { prisma } from "../../setup-db";
import { unwrapResolverError } from "@apollo/server/errors";
import { GraphQLFormattedError } from "graphql";

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
      message: "Algo deu errado, tente novamente"
    };
  }
};

export function passwordLenght(password: string): void {
  if (password.length < 6) {
    throw new CustomError(400, "A senha deve conter pelo menos 6 caracteres");
  }
}

export function hasLettersAndNumbers(password: string): void {
  const lettersAndNumbers: boolean = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  if (!lettersAndNumbers) {
    throw new CustomError(400, "A senha deve conter pelo menos uma letra e um número");
  }
}

export function isValidDate(dateInput: string): void {
  const datePattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(\d{4})$/.test(dateInput);

  if (!datePattern) {
    throw new CustomError(400, "Data inválida, por favor, informe uma data no formato dd-mm-yyyy");
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
    throw new CustomError(400, "Ano inválido. Ano deve estar entre 1900 e " + currentYear);
  }
}

export async function isValidEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (user?.email === email) {
    throw new CustomError(400, "Email já está sendo utilizado, por favor, escolha outro");
  }
}
