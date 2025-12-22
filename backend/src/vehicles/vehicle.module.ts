import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle } from './entities/vehicle.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])], // <--- Đăng ký ở đây
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehicleModule {}
