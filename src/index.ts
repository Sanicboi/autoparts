import "dotenv/config";
import { AppDataSource } from "./data-source";
import express from "express";

export const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    app.get("*splat", async (req, res) => {
      res.status(200).end();
    });

    app.listen(8080);
  })
  .catch((error) => console.log(error));
