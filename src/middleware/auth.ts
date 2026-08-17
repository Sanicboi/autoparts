import { FindOptionsRelations } from "typeorm";
import { User } from "../entities/User";
import express from "express";
import { HttpError } from "../errors";
import { decodePlainToken, decodeToken } from "../jwt";
import { ExtendedError, Socket } from "socket.io";

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

export interface AuthorizedSocket extends Socket {
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

export const authenticateSocket = async (
  socket: AuthorizedSocket,
  next: (err?: ExtendedError | undefined) => void,
) => {
  console.log('socket connection');
  const token = socket.handshake.auth.token;
  if (!token || typeof token !== "string") {
    next(new Error("Wrong token"));
    return;
  }

  try {
    const user = await decodePlainToken(token);
    socket.user = user;
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(new Error("Error decoding token"));
    }
    return;
  }



  next();
};
