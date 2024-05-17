import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ProductService } from './product/product.service';
import { ClientService } from './client/client.service';
import * as dotenv from 'dotenv';

dotenv.config();  // Certifique-se de que as variáveis de ambiente estão sendo carregadas

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const productService = app.get(ProductService);
  const clientService = app.get(ClientService);
  const numProducts = parseInt(process.env.NUM_PRODUCTS, 10) || 10;

  console.log('Number of Products:', numProducts);
  console.log('Admin Username:', process.env.MAGENTO_ADMIN_USERNAME);
  console.log('Admin Password:', process.env.MAGENTO_ADMIN_PASSWORD);
  console.log('Magento API URL:', process.env.MAGENTO_API_URL);

  const testUserEmail = 'testuser@example.com';
  const testUserPassword = 'TestPassword123';

  try {
    // Chamar a função para criar ou atualizar um cliente de teste
    const testCustomer = await clientService.createOrUpdateTestCustomer();
    if (testCustomer) {
      console.log('Cliente de teste criado ou atualizado com sucesso:', testCustomer);
    } else {
      console.log('Cliente de teste já existia.');
    }

    // Obter o token do cliente de teste
    const customerToken = await clientService.getCustomerToken(testUserEmail, testUserPassword);
    console.log('Dados do cliente de teste:');
    console.log(`Email: ${testUserEmail}`);
    console.log(`Senha: ${testUserPassword}`);
    console.log(`Token: ${customerToken}`);

    // Chamar a função para criar produtos automaticamente
    await productService.createFakeProducts(numProducts);
  } catch (error) {
    console.error('Error during client or product creation:', error);
  }

  await app.listen(3000);
}

bootstrap();
