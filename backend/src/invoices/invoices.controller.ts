import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // API tạo hóa đơn (Thường dùng cho Admin, nhưng bạn dùng để tạo data test)
  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  // API lấy danh sách hóa đơn của CHÍNH CƯ DÂN ĐÓ
  @Get('my-invoices')
  findMyInvoices(@Req() req) {
    const apartmentId = req.user.apartmentId;
    if (!apartmentId) {
      // Trường hợp user không gắn với căn hộ nào
      return [];
    }
    return this.invoicesService.findAllByApartment(apartmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }
}
