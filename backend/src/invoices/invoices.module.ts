import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Apartment } from '../apartments/entities/apartment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Apartment])], // <--- Đăng ký
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
