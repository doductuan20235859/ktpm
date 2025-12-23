// invoices.controller.ts
import { Controller, Get } from '@nestjs/common';
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
}