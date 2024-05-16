import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ProductService } from './product/product.service';
import * as dotenv from 'dotenv';

dotenv.config();  // Certifique-se de que as variáveis de ambiente estão sendo carregadas

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const productService = app.get(ProductService);
  const numProducts = parseInt(process.env.NUM_PRODUCTS, 10) || 10;

  console.log('Number of Products:', numProducts);
  console.log('Admin Username:', process.env.MAGENTO_ADMIN_USERNAME);
  console.log('Admin Password:', process.env.MAGENTO_ADMIN_PASSWORD);
  console.log('Magento API URL:', process.env.MAGENTO_API_URL);

  try {
    // Chamar a função para criar produtos automaticamente
    await productService.createFakeProducts(numProducts);
  } catch (error) {
    console.error('Error during product creation:', error);
  }

  await app.listen(3000);
}

bootstrap();
