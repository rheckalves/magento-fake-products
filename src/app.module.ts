import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductService } from './product/product.service';
import { MagentoService } from './common/services/magento.service';
import { ClientService } from './client/client.service';

@Module({
  imports: [HttpModule],
  providers: [ProductService, MagentoService, ClientService],
})
export class AppModule {}
