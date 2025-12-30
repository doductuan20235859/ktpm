
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { ResidentRole } from '../common/enums/database.enums';
import { User } from '../users/entities/user.entity';
@Injectable()
export class ApartmentsService {
  constructor(
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(User) // Inject thêm repository User
    private readonly userRepository: Repository<User>,
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
    // 1. Lấy dữ liệu kèm theo quan hệ owner và residents
    const apartments = await this.apartmentRepository.find({
      relations: ['owner', 'residents'],
    });

    // 2. Map dữ liệu để tính toán số thành viên (residentCount)
    return apartments.map((apt) => {
      const residents = apt.residents || [];
      
      // Kiểm tra xem có người thuê (TENANT) đang hoạt động hay không
      const activeResidents = residents.filter(r => r.isActive);
      const hasActiveTenant = activeResidents.some(
        (r) => r.role === ResidentRole.TENANT,
      );

      let residentCount = 0;

      if (hasActiveTenant) {
        // Nếu có người thuê: Chỉ đếm những người là TENANT
        residentCount = activeResidents.filter(
          (r) => r.role === ResidentRole.TENANT,
        ).length;
      } else {
        // Nếu không có người thuê: Đếm cả OWNER và MEMBER
        residentCount = activeResidents.filter(
          (r) => r.role === ResidentRole.OWNER || r.role === ResidentRole.MEMBER,
        ).length;
      }

      // 3. Trả về cấu trúc dữ liệu mong muốn cho Frontend
      return {
        id: apt.id,
        code: apt.code,
        areaSqm: apt.areaSqm,
        status: apt.status,
        ownerName: apt.owner ? apt.owner.fullName : null,
        ownerPhone: apt.owner ? apt.owner.phoneNumber : null,
        residentCount: residentCount, // Số thành viên trong căn hộ
      };
    });
  }


  // ================= FIND ONE =================
 async findOne(id: number) {
  const apartment = await this.apartmentRepository.findOne({
    where: { id },
    relations: ['owner', 'residents', 'residents.user'], // Đã bao gồm quan hệ owner
  });

  if (!apartment) throw new NotFoundException('Không tìm thấy căn hộ');

  return {
    ...apartment,
    // Lấy thông tin từ object owner (liên kết với entity User)
    ownerName: apartment.owner ? apartment.owner.fullName : 'Chưa có chủ hộ',
    ownerPhone: apartment.owner ? apartment.owner.phoneNumber : 'N/A',
    
    // Trả về danh sách thành viên được format sẵn
    members: apartment.residents?.map(res => ({
      id: res.id,
      name: res.user?.fullName || 'N/A',
      role: res.role,
      phone: res.user?.phoneNumber || 'N/A',
      joinDate: new Date(res.joinDate).toLocaleDateString('vi-VN'),
      isActive: res.isActive
    })) || []
  };
}
  // ================= UPDATE =================
  async update(id: number, updateApartmentDto: UpdateApartmentDto) {
  const apartment = await this.apartmentRepository.findOne({ 
    where: { id },
    relations: ['owner'] 
  });
  if (!apartment) throw new NotFoundException('Căn hộ không tồn tại');

  // XỬ LÝ CẬP NHẬT THÔNG TIN CHỦ HỘ
  if (apartment.owner) {
    // Nếu căn hộ đã có chủ, ta cập nhật trực tiếp vào User đó
    if (updateApartmentDto.ownerName) apartment.owner.fullName = updateApartmentDto.ownerName;
    if (updateApartmentDto.ownerPhone) apartment.owner.phoneNumber = updateApartmentDto.ownerPhone;
    
    await this.userRepository.save(apartment.owner);
  } else if (updateApartmentDto.ownerPhone) {
    // Nếu chưa có chủ, tìm User theo số điện thoại để gán vào
    const user = await this.userRepository.findOne({ where: { phoneNumber: updateApartmentDto.ownerPhone } });
    if (user) {
      apartment.ownerId = user.id;
    }
  }

  // Cập nhật các thông tin khác của căn hộ
  if (updateApartmentDto.areaSqm) apartment.areaSqm = Number(updateApartmentDto.areaSqm);
  if (updateApartmentDto.code) apartment.code = updateApartmentDto.code;
  if (updateApartmentDto.status) apartment.status = updateApartmentDto.status;

  await this.apartmentRepository.save(apartment);
  return this.findOne(id);
}
  // async update(id: number, updateApartmentDto: UpdateApartmentDto) {
  //   const apartment = await this.apartmentRepository.findOne({ where: { id } });
  //   if (!apartment) throw new NotFoundException(`Căn hộ không tồn tại`);
  //   if (updateApartmentDto.ownerPhone) {
  //     const user = await this.userRepository.findOne({
  //       where: { phoneNumber: updateApartmentDto.ownerPhone }
  //     });
  //     if (user) {
  //       apartment.ownerId = user.id; // Ánh xạ số điện thoại thành ID
  //     }
  //   }
  //   if (updateApartmentDto.areaSqm) {
  //     apartment.areaSqm = Number(updateApartmentDto.areaSqm);
  //   }
  //   // 2. Cập nhật dữ liệu vào entity
  //   // Object.assign sẽ đè các field có trong DTO lên entity hiện tại
  //   const { ownerPhone, ...safeData } = updateApartmentDto;
  //   Object.assign(apartment, safeData);

  //   // 3. Lưu vào DB
  //   await this.apartmentRepository.save(apartment);

  //   // 4. Trả về dữ liệu chi tiết (tận dụng hàm findOne đã viết ở bước trước)
  //   // Việc này giúp lấy lại đầy đủ quan hệ 'owner' và 'residents' mới nhất
  //   return this.findOne(id);
  // }
  // ================= DELETE =================
  async remove(id: number): Promise<{ deleted: true }> {
    const result = await this.apartmentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Apartment with id ${id} not found`);
    }

    return { deleted: true };
  }
}
