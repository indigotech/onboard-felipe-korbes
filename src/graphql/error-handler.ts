import { GraphQLFormattedError } from "graphql";
import { unwrapResolverError } from "@apollo/server/errors";

export class CustomError extends Error {
  code: number;
  additionalInfo: string;
  constructor(code: number, message: string, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo || "No additional info";
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
  }
  return formattedError;
};
