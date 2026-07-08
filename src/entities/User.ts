import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Пользователь
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  password: string;
}
