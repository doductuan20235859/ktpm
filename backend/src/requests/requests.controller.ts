import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    return this.requestsService.findAllMyRequests(req.user.userId);
  }
}
