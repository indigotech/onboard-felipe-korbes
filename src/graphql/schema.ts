export const defaultLimit = 10;

export const typeDefs = `#graphql
  type Query {
    hello: String
    getUser(id: Int!): User!
    getManyUsers(offset: Int, limit: Int = ${defaultLimit}): UserPagination!
  }

  type UserPagination {
    totalCount: Int!
    users: [User!]!
    hasMoreUsers: Boolean
  }

  type Mutation {
    createUser(data: UserInput!): User!
    login(data: LoginInput!): Authentication!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
  
  type User {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
    addresses: [Address]!
  }

  type Address {
    zipCode: Int!
    street: String!
    streetNumber: Int!
    city: String!
    state: String!
    complement: String
    neighborhood: String
  }

  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean!
  }

  type Authentication {
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
  rememberMe: boolean;
}
