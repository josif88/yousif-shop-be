import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { Product } from "./Product";

@Entity("categories")
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column({ default: true })
  active: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  updatedAt: Date;

  //relations

  @OneToMany((type) => Product, (product) => product.category)
  products: Product[];
}
