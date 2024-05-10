export const typeDefs = `#graphql
  type Query {
    hello: String
  }

  type Mutation {
    createUser(data: UserInput!): User!
    login(data: LoginInput!): authentication!
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

  input LoginInput {
    email: String!
    password: String!
  }

  type authentication {
    user: User!
    token: String!
  }
`;

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
