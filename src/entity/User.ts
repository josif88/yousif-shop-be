import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { Invoice } from "./Invoice";
import { Notification } from "./Notification";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  otp: number;

  @Column()
  active: boolean;

  @Column()
  complete: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @OneToMany((type) => Notification, (notification) => notification.user)
  notifications: Notification[];
}
