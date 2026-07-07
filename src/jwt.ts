import type { FindOptionsRelations } from "typeorm";
import { manager } from "./data-source";
import { User } from "./entities/User";
import { HttpError } from "./errors";
import jwt, { JwtPayload } from "jsonwebtoken";

interface ITokenPayload extends JwtPayload {
  id?: string | any;
}

/**
 * Декодит JWT и находит пользователя если смог
 * @param header HTTP-хэдер
 * @param relations Опции загрузки отношений (по умолчанию нет)
 * @returns Пользователя
 * @throws HttpError
 */
export const decodeToken = async (
  header: string,
  relations: FindOptionsRelations<User> = {},
): Promise<User> => {
  if (!process.env.JWT_KEY) throw new HttpError(500);
  const split = header.split(" ");
  if (split.length !== 2) throw new HttpError(401);
  if (split[0] !== "Bearer") throw new HttpError(401);
  const token = header[1];

  let data: string | ITokenPayload;
  try {
    data = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    throw new HttpError(401);
  }

  if (typeof data == "string") throw new HttpError(401);
  if (!data.id || typeof data.id !== "string") throw new HttpError(401);

  const user = await manager.findOne(User, {
    relations,
    where: {
      id: data.id,
    },
  });
  if (!user) throw new HttpError(404);
  return user;
};

/**
 * Создает токен
 * @param userOrId пользователь или его айди
 * @returns токен
 * @throws HttpError
 */
export const createToken = (userOrId: User | string): string => {
  if (!process.env.JWT_KEY) throw new HttpError(500);
  let id: string = typeof userOrId === "string" ? userOrId : userOrId.id;
  const token = jwt.sign(
    {
      id,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "7d",
    },
  );
  return token;
};
