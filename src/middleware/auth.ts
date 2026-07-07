import { FindOptionsRelations } from "typeorm";
import { User } from "../entities/User";
import express from "express";
import { HttpError } from "../errors";
import { decodeToken } from "../jwt";

/**
 * Интерфейс авторизации
 */
export interface AuthorizedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends express.Request<P, ResBody, ReqBody, ReqQuery> {
  user?: User;
}

/**
 * тип для краткости кода
 */
type middlewareFunc = (
  req: AuthorizedRequest,
  res: express.Response,
  next: express.NextFunction,
) => Promise<any>;

/**
 * фабрика промежуточных обработчиков авторизации
 * @param relations Отношения в базе данных
 * @returns промежуточный обработчик
 */
export const authenticate = (
  relations: FindOptionsRelations<User> = {},
): middlewareFunc => {
  return async (req, res, next) => {
    try {
      if (!req.headers.authorization) throw new HttpError(401);
      if (typeof req.headers.authorization !== "string")
        throw new HttpError(401);
      const user = await decodeToken(req.headers.authorization);
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.code).end();
        return;
      }
      return res.status(500).end();
    }
  };
};
