import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { InvoiceItem } from "./InvoiceItem";
import { User } from "./User";

@Entity("invoices")
export class Invoice extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "float" })
  total: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  long: string;

  @Column({ nullable: true })
  lat: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  updatedAt: Date;

  //relations

  @ManyToOne((type) => User, (user) => user.invoices)
  user: User;

  @OneToMany((type) => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoiceItems: InvoiceItem[];
}
