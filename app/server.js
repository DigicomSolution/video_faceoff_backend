require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
import createError from "http-errors";
import cookieParser from "cookie-parser";
import resolvers from "./graphql/resolver";
import typeDefs from "./graphql/schema";
import logger from "morgan";
import cors from "cors";
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const cron = require("./controllers/cron");
const socketIO = require("socket.io");
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

const port = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res }) => ({ req, res }),
  introspection: true,
});

app.use(cookieParser()); // to read cookies and attach it to request
server.applyMiddleware({ app });
app.use("/uploads", express.static("uploads"));

// error routes
// catch 404 & forward to error handler
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).send();
});
const serverType = app.listen({ port: port }, () =>
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
);
let io = socketIO(serverType);
io.on("connection", (socket) => {
  console.log("New user connected", socket.id);
});

export default app;
