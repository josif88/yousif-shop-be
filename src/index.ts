import "reflect-metadata";
import { createConnection } from "typeorm";
import { notFound } from "./middleware";
import * as express from "express";
import  v1 from "./route/app/v1";

createConnection().then(async (connection) => {
  const port = process.env.PORT || 5000;
  const app = express();

  app.use(express.json());

  //router
  app.use("/v1", v1);

  //not found page
  app.use(notFound);

  app.listen(port, () => {
    console.log(`listing on ${port}`);
  });
});
