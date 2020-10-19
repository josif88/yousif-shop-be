import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";

import { User } from "./User";

@Entity("passwords")
export class Password extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column({ nullable: true })
  otp: number;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: 0 })
  tries: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  changedAt: Date;

  @ManyToOne((type) => User, (user) => user.passwords)
  user: User;
}
