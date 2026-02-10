const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: Date
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String
    subject: String
    message: String!
    status: String
    createdAt: Date
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    contacts: [Contact!]!
    contact(id: ID!): Contact
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    submitContact(name: String!, email: String!, message: String!, phone: String, subject: String): Boolean!
    deleteContact(id: ID!): Boolean!
    replyContact(id: ID!, message: String!): Boolean!
  }
`;

module.exports = typeDefs;
