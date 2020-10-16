import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { Invoice } from "./Invoice";
import { Product } from "./Product";

@Entity("invoice-items")
export class InvoiceItem extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: "float" })
  subTotal: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => Invoice, (invoice) => invoice.invoiceItems)
  invoice: Invoice;

  @ManyToOne((type) => Product, (product) => product.invoiceItems)
  product: Product;
}
