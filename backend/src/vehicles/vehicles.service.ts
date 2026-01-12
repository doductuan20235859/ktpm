import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';
import { Apartment } from '../apartments/entities/apartment.entity';
import { VehicleStatus } from '../common/enums/database.enums';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(
    user: any,
    createVehicleDto: CreateVehicleDto,
    files: {
      vehiclePhoto?: Express.Multer.File[];
      registrationDoc?: Express.Multer.File[];
    },
  ) {
    // 1. Kiểm tra biển số đã tồn tại chưa
    const existing = await this.vehiclesRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });
    if (existing) {
      throw new BadRequestException(
        `Biển số ${createVehicleDto.plateNumber} đã được đăng ký`,
      );
    }

    // 2. Xử lý đường dẫn file
    const baseUrl = 'http://localhost:3001/uploads/';

    const photoUrl =
      files.vehiclePhoto && files.vehiclePhoto[0]
        ? `${baseUrl}${files.vehiclePhoto[0].filename}`
        : null;

    const regDocUrl =
      files.registrationDoc && files.registrationDoc[0]
        ? `${baseUrl}${files.registrationDoc[0].filename}`
        : null;

    // 3. Tạo Entity
    const newVehicle = this.vehiclesRepository.create({
      plateNumber: createVehicleDto.plateNumber,
      type: createVehicleDto.type,
      brand: createVehicleDto.brand,
      color: createVehicleDto.color,
      status: VehicleStatus.PENDING,
      photoUrl: photoUrl,
      registrationDocUrl: regDocUrl,
      user: { id: user.userId } as User,
      apartment: user.apartmentId
        ? ({ id: user.apartmentId } as Apartment)
        : undefined,
    });

    return await this.vehiclesRepository.save(newVehicle);
  }

  // Lấy danh sách xe của User
  async findAllMyVehicles(userId: number) {
    return await this.vehiclesRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Xem chi tiết 1 xe
  async findOne(id: number, userId: number) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['user', 'apartment'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy xe có ID ${id}`);
    }

    // Kiểm tra quyền sở hữu
    if (vehicle.user.id !== userId) {
      throw new BadRequestException('Bạn không có quyền xem xe này');
    }

    return vehicle;
  }

  // --- ADMIN: Lấy tất cả xe (Admin only) ---
  async findAllForAdmin() {
    return await this.vehiclesRepository.find({
      relations: ['user', 'apartment'],
      order: { createdAt: 'DESC' },
    });
  }

  // Sửa xe (owner)
  async update(id: number, userId: number, updateVehicleDto: any) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['user', 'apartment'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy xe có ID ${id}`);
    }

    if (vehicle.user.id !== userId) {
      throw new BadRequestException('Bạn không có quyền sửa xe này');
    }

    Object.assign(vehicle, updateVehicleDto);

    return await this.vehiclesRepository.save(vehicle);
  }

  // Sửa xe (Admin)
  async updateByAdmin(id: number, updateVehicleDto: any) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['user', 'apartment'],
    });
    if (!vehicle) throw new NotFoundException(`Không tìm thấy xe có ID ${id}`);

    Object.assign(vehicle, updateVehicleDto);

    return await this.vehiclesRepository.save(vehicle);
  }

  // Xóa bởi Admin
  async removeByAdmin(id: number) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException(`Không tìm thấy xe có ID ${id}`);

    if (vehicle.photoUrl) {
      this.deleteFile(vehicle.photoUrl);
    }

    if (vehicle.registrationDocUrl) {
      this.deleteFile(vehicle.registrationDocUrl);
    }

    await this.vehiclesRepository.remove(vehicle);

    return {
      message: `Đã xóa xe ${vehicle.plateNumber} thành công`,
      deletedId: id,
    };
  }

  // Xóa xe
  async remove(id: number, userId: number) {
    const vehicle = await this.findOne(id, userId);

    // Xóa file ảnh nếu có
    if (vehicle.photoUrl) {
      this.deleteFile(vehicle.photoUrl);
    }

    if (vehicle.registrationDocUrl) {
      this.deleteFile(vehicle.registrationDocUrl);
    }

    await this.vehiclesRepository.remove(vehicle);

    return {
      message: `Đã xóa xe ${vehicle.plateNumber} thành công`,
      deletedId: id,
    };
  }

  // Helper: Xóa file khỏi disk
  private deleteFile(fileUrl: string) {
    try {
      const filename = fileUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Lỗi xóa file:', error);
    }
  }
}
