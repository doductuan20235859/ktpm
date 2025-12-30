import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRequest_adminDto } from './dto/create-request.admin.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard) // Bắt buộc đăng nhập
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Req() req, @Body() createRequestDto: CreateRequestDto) {
    // req.user chứa thông tin từ JwtStrategy (userId, role, apartmentId...)
    return this.requestsService.create(req.user, createRequestDto);
  }

  @Get('my-requests')
  findAllMyRequests(@Req() req) {
    return this.requestsService.findAllMyRequests(req.user);
  }

  @Post('admin')
  createadmin(@Body() createRequestDto: CreateRequest_adminDto) {
    return this.requestsService.CreateRequest_admin(createRequestDto);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll_admin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne_admin(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update_admin(+id, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove_admin(+id);
  }
}
