import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])], // <--- Đăng ký ở đây
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
