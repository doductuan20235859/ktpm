import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { User } from '../users/entities/user.entity';
import { RequestStatus, RequestPriority } from '../common/enums/database.enums';
import { Apartment } from '../apartments/entities/apartment.entity';
import { CreateRequest_adminDto } from './dto/create-request.admin.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
  ) {}

  async create(user: any, createRequestDto: CreateRequestDto) {
    // 1. Tạo mã Ticket Code tự động (Ví dụ: REQ-TIMESTAMP)
    // Để chuyên nghiệp hơn bạn có thể dùng thư viện generate string, ở đây dùng timestamp cho đơn giản
    const ticketCode = `REQ-${Date.now()}`;

    // 2. Tạo Entity
    const newRequest = this.requestsRepository.create({
      ...createRequestDto,
      ticketCode: ticketCode,
      status: RequestStatus.NEW,
      priority: createRequestDto.priority || RequestPriority.NORMAL,
      // Gán người tạo (Lấy từ token)
      createdBy: { id: user.userId } as User,
      // Gán căn hộ (Lấy từ token login trả về apartmentId)
      apartment: user.apartmentId
        ? ({ id: user.apartmentId } as Apartment)
        : undefined,
    });

    // 3. Lưu vào DB
    return await this.requestsRepository.save(newRequest);
  }

  // Hàm lấy danh sách yêu cầu của user (để hiển thị list bên dưới)
  async findAllMyRequests(userId: number) {
    return await this.requestsRepository.find({
      where: { createdBy: { id: userId } },
      order: { createdAt: 'DESC' }, // Mới nhất lên đầu
      relations: ['createdBy', 'apartment'], // Join bảng nếu cần
    });
  }
  async CreateRequest_admin(
    createRequestDto: CreateRequest_adminDto,
  ): Promise<Request> {
    const { apartmentId, createdByUserId, ...rest } = createRequestDto;
    const request = this.requestsRepository.create({
      ...rest,
      apartment: { id: apartmentId },
      createdBy: { id: createdByUserId },
    });
    const savedRequest = await this.requestsRepository.save(request);
    return this.findOne_admin(savedRequest.id);
  }

  async findAll_admin(): Promise<Request[]> {
    return this.requestsRepository.find({
      relations: ['apartment', 'createdBy', 'assignedTo', 'notes'],
    });
  }

  async findOne_admin(id: number): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['apartment', 'createdBy', 'assignedTo', 'notes'],
    });
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return request;
  }

  async update_admin(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    // Lấy request hiện tại
    const request = await this.findOne_admin(id);

    // Cập nhật các trường được cung cấp
    if (updateRequestDto.title !== undefined)
      request.title = updateRequestDto.title;
    if (updateRequestDto.category !== undefined)
      request.category = updateRequestDto.category;
    if (updateRequestDto.priority !== undefined)
      request.priority = updateRequestDto.priority;
    if (updateRequestDto.status !== undefined)
      request.status = updateRequestDto.status;
    if (updateRequestDto.description !== undefined)
      request.description = updateRequestDto.description;

    // Xử lý quan hệ
    if (updateRequestDto.apartmentId !== undefined) {
      request.apartment = { id: updateRequestDto.apartmentId } as any;
    }
    if (updateRequestDto.assignedToUserId !== undefined) {
      request.assignedTo = updateRequestDto.assignedToUserId
        ? ({ id: updateRequestDto.assignedToUserId } as any)
        : null;
    }

    // Lưu vào database
    await this.requestsRepository.save(request);
    return this.findOne_admin(id);
  }

  async remove_admin(id: number): Promise<void> {
    await this.requestsRepository.delete(id);
  }
}
