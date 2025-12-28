import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { User } from '../users/entities/user.entity';
import { RequestStatus, RequestPriority } from '../common/enums/database.enums';
import { Apartment } from '../apartments/entities/apartment.entity';

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
}
