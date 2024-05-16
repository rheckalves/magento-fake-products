import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create-fake-products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create fake products' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fake products created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to create fake products.',
  })
  async createFakeProducts(@Body('numProducts') numProducts: number): Promise<any> {
    return await this.productService.createFakeProducts(numProducts);
  }
}
