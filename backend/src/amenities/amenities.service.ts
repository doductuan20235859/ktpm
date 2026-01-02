// src/amenities/amenities.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from './entities/amenity.entity';
import { AmenityStatus } from '../common/enums/database.enums';
import { CreateAmenityDto } from './dto/create-amenity.dto';
// XÓA IMPORT UpdateBookingStatusDto VÌ KHÔNG DÙNG Ở ĐÂY

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
  ) {}

  private transformResponse(amenity: Amenity) {
    return {
      ...amenity,
      isActive: amenity.status === AmenityStatus.ACTIVE,
    };
  }

  async findAll() {
    const amenities = await this.amenitiesRepository.find({
      order: { id: 'ASC' },
    });
    return amenities.map((item) => this.transformResponse(item));
  }

  async findOne(id: number) {
    const amenity = await this.amenitiesRepository.findOne({ where: { id } });
    if (!amenity)
      throw new NotFoundException(`Không tìm thấy tiện ích ID: ${id}`);
    return this.transformResponse(amenity);
  }

  async create(data: CreateAmenityDto) {
    const { ...cleanData } = data as any;
    delete cleanData.id;
    delete cleanData.isActive;

    const newAmenity = this.amenitiesRepository.create(
      cleanData,
    ) as unknown as Amenity;
    const saved = await this.amenitiesRepository.save(newAmenity);
    return this.transformResponse(saved);
  }

  async update(id: number, data: CreateAmenityDto) {
    const amenity = await this.amenitiesRepository.findOne({ where: { id } });
    if (!amenity)
      throw new NotFoundException(`Không tìm thấy tiện ích ID: ${id}`);

    const { ...updateData } = data as any;
    delete updateData.id;
    delete updateData.isActive;
    delete updateData.createdAt;

    const updatedAmenity = this.amenitiesRepository.merge(amenity, updateData);
    const saved = await this.amenitiesRepository.save(updatedAmenity);
    return this.transformResponse(saved);
  }

  async remove(id: number) {
    const result = await this.amenitiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy tiện ích ID: ${id}`);
    }
  }

  // --- ĐÃ XÓA HÀM updateStatus Ở ĐÂY ---
}
