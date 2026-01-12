import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource, // Inject DataSource để kiểm tra DB
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      const queryResult = await this.dataSource.query('SELECT 1');
      const countResult = await this.dataSource.query(
        'SELECT COUNT(*) FROM vehicles',
      );
      return {
        dbInitialized: this.dataSource.isInitialized,
        queryResult: queryResult,
        vehiclesCount: countResult?.[0]?.count ?? '0',
      };
    } catch (error: any) {
      return {
        dbInitialized: this.dataSource.isInitialized,
        error: error.message,
      };
    }
  }
}
