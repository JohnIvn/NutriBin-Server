import {
  Controller,
  Get,
  Post,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../service/database/database.service';

type SaleRow = {
  sale_id: string;
  sale_date: string | null;
  amount: number;
  region: string | null;
  product: string | null;
  quantity: number;
  customer_id: string | null;
  date_created: string;
};

@Controller('sales')
export class SalesController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async listSales() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<SaleRow>(
        `SELECT sale_id, sale_date, amount, region, product, quantity, customer_id, date_created
         FROM sales
         ORDER BY sale_date DESC NULLS LAST, date_created DESC
         LIMIT 500`,
      );

      return { ok: true, sales: result.rows };
    } catch (error) {
      console.error('Failed to fetch sales', error);
      throw new InternalServerErrorException('Failed to fetch sales');
    }
  }

  @Post()
  async createSale(
    @Body()
    body: {
      sale_date?: string;
      amount?: number;
      region?: string;
      product?: string;
      quantity?: number;
      customer_id?: string;
    },
  ) {
    if (!body || body.amount === undefined) {
      throw new BadRequestException('amount is required');
    }

    const client = this.databaseService.getClient();

    try {
      const res = await client.query<SaleRow>(
        `INSERT INTO sales (sale_date, amount, region, product, quantity, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING sale_id, sale_date, amount, region, product, quantity, customer_id, date_created`,
        [
          body.sale_date || null,
          body.amount,
          body.region || null,
          body.product || null,
          body.quantity || 1,
          body.customer_id || null,
        ],
      );

      return { ok: true, sale: res.rows[0] };
    } catch (error) {
      console.error('Failed to create sale', error);
      throw new InternalServerErrorException('Failed to create sale');
    }
  }
}
