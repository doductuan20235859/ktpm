import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const { apartmentId, createdByUserId, ...rest } = createRequestDto;
    const request = this.requestRepository.create({
      ...rest,
      apartment: { id: apartmentId },
      createdBy: { id: createdByUserId },
    });
    const savedRequest = await this.requestRepository.save(request);
    return this.findOne(savedRequest.id);
  }

  async findAll(): Promise<Request[]> {
    return this.requestRepository.find({
      relations: ['apartment', 'createdBy', 'assignedTo', 'notes'],
    });
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['apartment', 'createdBy', 'assignedTo', 'notes'],
    });
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return request;
  }

  async update(id: number, updateRequestDto: UpdateRequestDto): Promise<Request> {
    await this.requestRepository.update(id, updateRequestDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.requestRepository.delete(id);
  }
}
