// invoices.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices') // Đường dẫn API: /invoices
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getAllInvoices() {
    const data = await this.invoicesService.findAll();
    return {
      success: true,
      data: data,
    };
  }

  @Get('apartment/:code')
  async getByApartmentCode(@Param('code') code: string) {
    return await this.invoicesService.findByApartmentCode(code);
  }
}