export const loginUserMutation = `#graphql
  mutation Login ($data: LoginInput!) {
    login(data: $data) {
      user {
        id
        name
        email
        birthDate
      }
      token
    }
  }`;

export const createUserMutation = `#graphql
  mutation CreateUser ($data: UserInput!) {
    createUser(data: $data) {
      id
      name
      email
      birthDate
    }
  }`;
