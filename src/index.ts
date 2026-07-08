import "dotenv/config";
import { AppDataSource } from "./data-source";
import express from "express";
import auth from "./routers/auth";

export const app = express();
app.use(express.json());
app.use(auth);

app.get("*splat", async (req, res) => {
  res.status(200).end();
});

AppDataSource.initialize()
  .then(async () => {
    app.listen(8080);
  })
  .catch((error) => console.log(error));
