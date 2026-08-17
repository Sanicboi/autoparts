import "dotenv/config";
import { AppDataSource } from "./data-source";
import express from "express";
import auth from "./routers/auth";
import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket, AuthorizedSocket } from "./middleware/auth";
import * as exist from "./parsers/exist";
import * as autodoc from "./parsers/autodoc";
import puppeteer from "puppeteer";
import morgan from "morgan";
import path from "path";

export const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(auth);
app.use(express.static(path.join(process.cwd(), 'dist')));

// app.get("*splat", async (req, res) => {
//   res.status(200).end();
// });

const httpServer = createServer(app);
const io = new Server(httpServer, {});
io.use(authenticateSocket);
io.on("connection", async (socket: AuthorizedSocket) => {
  socket.on("parse", async (vin: string[]) => {
    if (!socket.user) return;
    if (!vin || !Array.isArray(vin)) return;
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    for (const v of vin) {
      try {
        const ex = await exist.getLowestPrice(v, browser);
        const ad = await autodoc.getLowestPrice(v, browser);
        socket.emit("result", {
          vin: v,
          exist: ex,
          autodoc: ad,
        });
      } catch (error) {}
    }

    await browser.close();
    socket.emit("end-parse");
  });
});

AppDataSource.initialize()
  .then(async () => {
    httpServer.listen(8080);
  })
  .catch((error) => console.log(error));
