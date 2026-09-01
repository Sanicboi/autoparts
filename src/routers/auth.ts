import express from "express";
import { HttpError } from "../errors";
import { manager } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { createToken } from "../jwt";
import { authenticate, AuthorizedRequest } from "../middleware/auth";

const router = express.Router();

/**
 * Вход на сайт
 */
router.post(
  "/api/login",
  async (
    req: express.Request<
      any,
      any,
      {
        username?: string | any;
        password?: string | any;
      }
    >,
    res,
  ) => {
    try {
      if (!req.body.username || !req.body.password) throw new HttpError(400);
      if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string"
      )
        throw new HttpError(400);

      const user = await manager.findOne(User, {
        where: {
          name: req.body.username,
        },
      });

      if (!user) throw new HttpError(400);

      const matches = await bcrypt.compare(req.body.password, user.password);
      if (!matches) throw new HttpError(401);

      const token = createToken(user);

      res
        .status(200)
        .json({
          token: token,
        })
        .end();
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.code).end();
      }
      return res.status(500).end();
    }
  },
);

/**
 * Создание аккаунта
 */
router.post(
  "/api/user",
  async (
    req: express.Request<
      any,
      any,
      {
        username?: string | any;
        password?: string | any;
        signupKey?: string | any;
      }
    >,
    res,
  ) => {
    try {
      if (!req.body.username || !req.body.password || !req.body.signupKey)
        throw new HttpError(400);
      if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string" ||
        typeof req.body.signupKey !== "string"
      )
        throw new HttpError(400);

      if (req.body.signupKey !== process.env.SIGNUP_KEY!)
        throw new HttpError(401);

      let user = await manager.findOne(User, {
        where: {
          name: req.body.username,
        },
      });

      if (user) throw new HttpError(409);

      user = new User();
      user.name = req.body.username;
      user.password = await bcrypt.hash(req.body.password, 12); // TODO: Сделать проверку валидности
      await manager.save(user);

      const token = createToken(user);

      res.status(201).json({
        token: token,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.code).end();
      }
      return res.status(500).end();
    }
  },
);

/**
 * Бессмысленная фигня
 */
router.get("/api/me", authenticate(), async (req: AuthorizedRequest, res) => {
  res.status(200).json({
    username: req.user!.name,
  });
});

/**
 * Удаление аккаунта
 */
router.delete(
  "/api/user",
  authenticate(),
  async (req: AuthorizedRequest, res) => {
    if (!req.user) return;
    await manager.remove(req.user);
    res.status(204).end();
  },
);

export default router;
