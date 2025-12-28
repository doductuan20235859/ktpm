import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
  ) {}

  // ================= CREATE =================
  async create(dto: CreateApartmentDto): Promise<Apartment> {
    const {
      buildingName,
      unitNumber,
      floorNumber,
      areaSqm,
      status,
    } = dto;

    // ✅ Sinh code: A-202
    const code = `${buildingName}-${unitNumber}`;

    // ✅ Check trùng code
    const existed = await this.apartmentRepository.findOne({
      where: { code },
    });

    if (existed) {
      throw new BadRequestException(
        `Apartment with code ${code} already exists`,
      );
    }

    const apartment = this.apartmentRepository.create({
      code,
      buildingName: `Tòa ${buildingName}`,
      unitNumber,
      floorNumber,
      areaSqm,
      status,
    });

    return this.apartmentRepository.save(apartment);
  }

  // ================= FIND ALL =================
  async findAll() {
  const apartments = await this.apartmentRepository.find({
    relations: ['owner'],
  });

  return apartments.map((apt) => ({
    id: apt.id,
    code: apt.code,
    areaSqm: apt.areaSqm,
    status: apt.status,
    ownerName: apt.owner?.fullName ?? null,
    ownerPhone: apt.owner?.phoneNumber ?? null,
  }));
}


  // ================= FIND ONE =================
  async findOne(id: number): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findOne({
      where: { id },
    });

    if (!apartment) {
      throw new NotFoundException(`Apartment with id ${id} not found`);
    }

    return apartment;
  }

  // ================= UPDATE =================
  async update(
    id: number,
    dto: UpdateApartmentDto,
  ): Promise<Apartment> {
    const apartment = await this.findOne(id);

    Object.assign(apartment, dto);

    // Nếu update buildingName hoặc unitNumber → update lại code
    if (dto.buildingName || dto.unitNumber) {
      apartment.code = `${apartment.buildingName}-${apartment.unitNumber}`;
    }

    return this.apartmentRepository.save(apartment);
  }

  // ================= DELETE =================
  async remove(id: number): Promise<{ deleted: true }> {
    const result = await this.apartmentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Apartment with id ${id} not found`);
    }

    return { deleted: true };
  }
}
