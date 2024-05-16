import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MagentoService } from '../common/services/magento.service';

@Module({
  imports: [HttpModule],
  providers: [ProductService, MagentoService],
  controllers: [ProductController],
})
export class ProductModule {}
