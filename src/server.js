require("dotenv").config({ path: "./.env" });

const cors = require("cors");
const sequelize = require("./db/index");
const jwt = require("jsonwebtoken");

const User = require("./models/model.users");
const Book = require("./models/model.books");
const UserBook = require("./models/model.UserBook");

User.belongsToMany(Book, { through: UserBook });
Book.belongsToMany(User, { through: UserBook });

sequelize
  .sync()
  //   .sync({ force: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

const { ApolloServer } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const typeDefs = require("./graphql.schema/typedefs");
const resolvers = require("./graphql.resolvers/resovers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  context: ({ req }) => {
    const { authorization } = req.headers;
    if (authorization) {
      const { userId } = jwt.verify(authorization, process.env.TOKEN_SECRET);
      return { userId };
    }
  },
});

server.listen({ port: process.env.PORT || 6000 }).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
