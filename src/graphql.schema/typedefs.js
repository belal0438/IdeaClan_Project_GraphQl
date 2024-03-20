const { gql } = require("apollo-server");

const typeDefs = gql`
  scalar Upload

  type Query {
    users: [User]
    books: [Book]
    queryBookStatus(status: String!): [Book]
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    book: [Book]
  }

  type Token {
    token: String
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    status: String!
    imageUrl: String!
  }

  type MutationResponse {
    message: String!
  }

  type borrowOrSoldBookResponse {
    message: String
  }

  type Mutation {
    signupUser(newUser: UserInput!): User
    signinUser(userLoginInput: InputSinginUser!): Token
    addBook(book: BookInput!): Book!
    edditBookDetail(edditbook: BookDetail!): MutationResponse
    deleteBook(id: ID!): MutationResponse
    borrowedOrSoldBook(
      bookIdandStatus: bookIdandsoldOrBorrow!
    ): borrowOrSoldBookResponse!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: String
  }

  input InputSinginUser {
    email: String!
    password: String!
  }

  input BookInput {
    title: String!
    author: String!
    image: Upload!
  }

  input BookDetail {
    id: ID!
    title: String
    author: String
    image: Upload
  }

  input bookIdandsoldOrBorrow {
    id: ID!
    status: String!
  }
`;
module.exports = typeDefs;
