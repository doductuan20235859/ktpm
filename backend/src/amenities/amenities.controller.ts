import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards, // 1. THÊM IMPORT NÀY
} from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  // 2. CHUYỂN HÀM NÀY LÊN ĐÂY (Phải nằm trên @Get(':id'))
  @UseGuards(JwtAuthGuard)
  @Get('with-bookings')
  findAllWithBookings() {
    return this.amenitiesService.findAllWithBookings();
  }

  // --- Các hàm có tham số :id phải nằm dưới các đường dẫn tĩnh ---

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.amenitiesService.findOne(id);
  }

  @Post()
  create(@Body() createAmenityDto: CreateAmenityDto) {
    return this.amenitiesService.create(createAmenityDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmenityDto: CreateAmenityDto,
  ) {
    return this.amenitiesService.update(id, updateAmenityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amenitiesService.remove(id);
  }
}
