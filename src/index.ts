import "reflect-metadata";
import { createConnection } from "typeorm";
import { language, notFound } from "./middleware";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import v1 from "./route/app/v1";

createConnection().then(async (connection) => {
  const port = process.env.PORT || 5000;

  const app = express();

  app.use(express.json());

  app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
    })
  );

  //language and local setter
  app.use(language);

  //router
  app.use("/v1", v1);

  //not found page
  app.use(notFound);

  app.listen(port, () => {
    console.log(`listing on ${port}`);
  });
});
