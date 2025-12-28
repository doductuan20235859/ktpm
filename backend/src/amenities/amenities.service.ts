import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from './entities/amenity.entity';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { BookingStatus } from '../common/enums/database.enums';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async create(createAmenityDto: CreateAmenityDto): Promise<Amenity> {
    const amenity = this.amenityRepository.create(createAmenityDto);
    return await this.amenityRepository.save(amenity);
  }

  async findAll(): Promise<Amenity[]> {
    return await this.amenityRepository.find({ relations: ['bookings'] });
  }

  async findOne(id: number): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });
    if (!amenity) throw new NotFoundException(`Amenity #${id} not found`);
    return amenity;
  }

  async checkSlotAvailability(
    amenityId: number,
    slot: string,
    date: string,
  ): Promise<boolean> {
    const amenity = await this.findOne(amenityId);
    if (!amenity.bookings) return true;

    const isBooked = amenity.bookings.some(
      (booking) =>
        booking.timeSlot === slot &&
        booking.status === BookingStatus.PENDING &&
        booking.bookingDate.toString() === date,
    );
    return !isBooked;
  }

  async update(
    id: number,
    updateAmenityDto: UpdateAmenityDto,
  ): Promise<Amenity> {
    const amenity = await this.amenityRepository.preload({
      id: id,
      ...updateAmenityDto,
    });
    if (!amenity) throw new NotFoundException(`Amenity #${id} not found`);
    return await this.amenityRepository.save(amenity);
  }

  async remove(id: number): Promise<Amenity> {
    const amenity = await this.findOne(id);
    return await this.amenityRepository.remove(amenity);
  }
}
