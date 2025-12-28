import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectRepository(Apartment)
    private apartmentRepository: Repository<Apartment>,
  ) {}

  async create(createApartmentDto: CreateApartmentDto): Promise<Apartment> {
    const apartment = this.apartmentRepository.create(createApartmentDto);
    return this.apartmentRepository.save(apartment);
  }

  async findAll(): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      relations: ['owner', 'residents'],
    });
  }

  async findOne(id: number): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findOne({
      where: { id },
      relations: ['owner', 'residents'],
    });
    if (!apartment) {
      throw new NotFoundException(`Apartment with ID ${id} not found`);
    }
    return apartment;
  }

  async update(id: number, updateApartmentDto: UpdateApartmentDto): Promise<Apartment> {
    await this.apartmentRepository.update(id, updateApartmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.apartmentRepository.delete(id);
  }
}
