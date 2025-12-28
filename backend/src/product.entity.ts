import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // Đây là đánh dấu bảng trong Database
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ nullable: true }) // Cho phép null
  description: string;
}
