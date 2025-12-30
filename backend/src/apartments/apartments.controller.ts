import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post('create')
create(@Body() createApartmentDto: CreateApartmentDto) {
  console.log('📦 CreateApartmentDto:', createApartmentDto);
  return this.apartmentsService.create(createApartmentDto);
}
  @Get()
  findAll() {
    return this.apartmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apartmentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateApartmentDto: UpdateApartmentDto
  ) {
    // Chúng ta trả về kết quả từ service đã được format lại thông tin owner/residents
    return await this.apartmentsService.update(+id, updateApartmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apartmentsService.remove(+id);
  }
}
