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
    // Lấy request hiện tại
    const request = await this.findOne(id);
    
    // Cập nhật các trường được cung cấp
    if (updateRequestDto.title !== undefined) request.title = updateRequestDto.title;
    if (updateRequestDto.category !== undefined) request.category = updateRequestDto.category;
    if (updateRequestDto.priority !== undefined) request.priority = updateRequestDto.priority;
    if (updateRequestDto.status !== undefined) request.status = updateRequestDto.status;
    if (updateRequestDto.description !== undefined) request.description = updateRequestDto.description;
    
    // Xử lý quan hệ
    if (updateRequestDto.apartmentId !== undefined) {
      request.apartment = { id: updateRequestDto.apartmentId } as any;
    }
    if (updateRequestDto.assignedToUserId !== undefined) {
      request.assignedTo = updateRequestDto.assignedToUserId ? { id: updateRequestDto.assignedToUserId } as any : null;
    }
    
    // Lưu vào database
    await this.requestRepository.save(request);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.requestRepository.delete(id);
  }
}
