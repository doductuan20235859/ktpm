import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UseInterceptors,
  UploadedFiles,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Req() req) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Chỉ admin mới có quyền truy cập danh sách này',
      );
    }
    return this.vehiclesService.findAllForAdmin();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @Req() req,
  ) {
    if (req.user && req.user.role === 'ADMIN') {
      return this.vehiclesService.updateByAdmin(id, updateVehicleDto);
    }
    return this.vehiclesService.update(id, req.user.userId, updateVehicleDto);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'vehiclePhoto', maxCount: 1 },
        { name: 'registrationDoc', maxCount: 1 },
        { name: 'idCard', maxCount: 1 },
        { name: 'contractDoc', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
            );
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  create(
    @Req() req,
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFiles()
    files: {
      vehiclePhoto?: Express.Multer.File[];
      registrationDoc?: Express.Multer.File[];
      idCard?: Express.Multer.File[];
      contractDoc?: Express.Multer.File[];
    },
  ) {
    return this.vehiclesService.create(req.user, createVehicleDto, files);
  }

  @Get('my-vehicles')
  findAllMyVehicles(@Req() req) {
    return this.vehiclesService.findAllMyVehicles(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.vehiclesService.findOne(id, req.user.userId);
  }

  @Delete(':id/admin')
  removeByAdmin(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ admin mới có quyền xóa');
    }
    return this.vehiclesService.removeByAdmin(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.vehiclesService.remove(id, req.user.userId);
  }
}
