import "dotenv/config";
import { AppDataSource } from "./data-source";
import express from "express";
import auth from "./routers/auth";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { authenticateSocket, AuthorizedSocket } from "./middleware/auth";
import * as exist from "./parsers/exist";
import * as autodoc from "./parsers/autodoc";

export const app = express();
app.use(express.json());
app.use(auth);

// app.get("*splat", async (req, res) => {
//   res.status(200).end();
// });

const httpServer = createServer(app);
const io = new Server(httpServer, {});
io.use(authenticateSocket);
io.on("connection", async (socket: AuthorizedSocket) => {
  socket.on("parse", async (vin: string) => {
    if (!socket.user) return;
    if (!vin || typeof vin !== "string") return;
    try {
      const existResults = await exist.getLowestPrices([vin]);
      const autodocResults = await autodoc.getLowestPrices([vin]);
      // TODO
      socket.emit("parse-results", {
        exist: existResults,
        autodoc: autodocResults,
      });
    } catch (error) {
      return;
    }
  });

  socket.on("parse-multiple", async (vin: string[]) => {
    if (!socket.user) return;
    if (!vin || !Array.isArray(vin)) return;
    try {
      const existResults = await exist.getLowestPrices(vin);
      const autodocResults = await autodoc.getLowestPrices(vin);
      // TODO
      socket.emit("parse-results", {
        exist: existResults,
        autodoc: autodocResults,
      });
    } catch (error) {
      return;
    }
  });
});

AppDataSource.initialize()
  .then(async () => {
    httpServer.listen(8080);
  })
  .catch((error) => console.log(error));
