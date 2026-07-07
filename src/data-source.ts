import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: +process.env.POSTGRES_PORT!,
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  synchronize: true,
  logging: Boolean(process.env.PROD! == "true"),
  entities: [User],
  migrations: [],
  subscribers: [],
});

export const manager = AppDataSource.manager;
