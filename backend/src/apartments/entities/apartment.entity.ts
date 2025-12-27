import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApartmentResident } from './apartment-resident.entity';
import { ApartmentStatus } from '../../common/enums/database.enums';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Request } from '../../requests/entities/request.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('apartments')
export class Apartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ name: 'building_name', length: 50 })
  buildingName: string;

  @Column({ name: 'unit_number', length: 20, nullable: true })
  unitNumber: string;

  @Column({ name: 'floor_number', default: 1 })
  floorNumber: number;

  @Column('decimal', {
    name: 'area_sqm',
    precision: 10,
    scale: 2,
    default: 0,
  })
  areaSqm: number;

  @Column({
    type: 'enum',
    enum: ApartmentStatus,
    default: ApartmentStatus.VACANT,
  })
  status: ApartmentStatus;

  // ===== OWNER =====
  @Column({ name: 'owner_id', nullable: true })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.ownedApartments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // ===== RELATIONS (BẮT BUỘC PHẢI CÓ) =====
  @OneToMany(() => ApartmentResident, (res) => res.apartment)
  residents: ApartmentResident[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.apartment)
  vehicles: Vehicle[];

  @OneToMany(() => Request, (req) => req.apartment)
  requests: Request[];

  @OneToMany(() => Invoice, (inv) => inv.apartment)
  invoices: Invoice[];
}
