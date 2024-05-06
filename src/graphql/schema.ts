export const typeDefs = `#graphql
  type Query {
    hello: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
  }

  type Mutation {
    createUser(data: UserInput!): User
  }
`;

export type UserInput = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
};
