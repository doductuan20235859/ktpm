import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; //
import { InvoiceItemsService } from './invoice_items.service';
import { InvoiceItemsController } from './invoice_items.controller';
import { InvoiceItem } from './entities/invoice_item.entity'; //

@Module({
  imports: [
    // Quan trọng: Phải đăng ký Entity ở đây để NestJS tạo ra Repository
    TypeOrmModule.forFeature([InvoiceItem]) 
  ],
  controllers: [InvoiceItemsController],
  providers: [InvoiceItemsService],
  exports: [InvoiceItemsService] // Export nếu bạn muốn module khác sử dụng service này
})
export class InvoiceItemsModule {}