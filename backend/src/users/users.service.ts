import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../common/enums/database.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. Tạo mới User
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Lưu ý: Do bạn yêu cầu không băm mật khẩu nên lưu trực tiếp.
    // Nếu sau này muốn bảo mật, hãy dùng bcrypt.hash ở đây.
    const newUser = this.usersRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password, // Giả sử DTO gửi lên field là 'password'
    });
    return await this.usersRepository.save(newUser);
  }

  // 2. Lấy danh sách tất cả User
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // 3. Lấy chi tiết 1 User theo ID
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      // Nếu muốn lấy kèm thông tin căn hộ đang ở thì mở comment dòng dưới:
      // relations: ['residents', 'residents.apartment'],
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy User với ID ${id}`);
    }
    return user;
  }

  // 4. Tìm User theo số điện thoại (Dùng cho Login)
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { phoneNumber },
    });
  }

  // 5. Cập nhật thông tin User
  async update(id: number, updateUserDto: UpdateUserDto) {
    // updateUserDto chỉ chứa các trường cần sửa
    return await this.usersRepository.update(id, updateUserDto);
  }

  // 6. [QUAN TRỌNG] Cập nhật Avatar (Hàm bạn đang cần)
  async updateAvatar(id: number, avatarUrl: string) {
    return await this.usersRepository.update(id, { avatarUrl });
  }

  // 7. Xóa User
  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // 1. Tìm user và lấy mật khẩu hiện tại (Vì mặc định nó bị ẩn)
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash') // Lấy cột password_hash ra
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // 2. Kiểm tra mật khẩu cũ có đúng không
    // (Lưu ý: Bạn đang dùng plain text, nếu dùng bcrypt phải sửa đoạn này)
    if (user.passwordHash !== currentPassword) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    // 3. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ (Optional)
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu cũ',
      );
    }

    // 4. Cập nhật mật khẩu mới
    user.passwordHash = newPassword;

    // Dùng save để kích hoạt các hook (nếu có) hoặc update cục bộ
    // Hoặc dùng update cho nhanh:
    await this.usersRepository.update(userId, { passwordHash: newPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ================= STATS =================
  async getStats() {
    const total = await this.usersRepository.count();
    const admins = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const residents = await this.usersRepository.count({
      where: { role: UserRole.RESIDENT },
    });

    return { total, admins, residents };
  }
}
