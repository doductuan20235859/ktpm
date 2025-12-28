import { PartialType } from '@nestjs/mapped-types';
import { InvoiceItemDto } from './create-invoice_item.dto';

export class UpdateInvoiceItemDto extends PartialType(InvoiceItemDto) {}
