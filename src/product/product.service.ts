import { Injectable } from '@nestjs/common';
import { MagentoService } from '../common/services/magento.service';
import * as faker from 'faker';

@Injectable()
export class ProductService {
  constructor(private readonly magentoService: MagentoService) {}

  generateProducts(numProducts: number) {
    const products = [];
    for (let i = 0; i < numProducts; i++) {
      products.push({
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        description: faker.lorem.sentence(),
        status: 'Enabled',
        quantity: faker.datatype.number({ min: 0, max: 100 }),
      });
    }
    return products;
  }

  async createFakeProducts(numProducts: number) {
    const username = process.env.MAGENTO_ADMIN_USERNAME;
    const password = process.env.MAGENTO_ADMIN_PASSWORD;

    const accessToken = await this.magentoService.getAccessToken(username, password);
    const products = this.generateProducts(numProducts);

    for (const product of products) {
      const sku = product.name.replace(/\s+/g, '-').toLowerCase();
      const productData = {
        product: {
          sku: sku,
          name: product.name,
          price: product.price,
          status: product.status === 'Enabled' ? 1 : 2,
          type_id: 'simple',
          attribute_set_id: 4,
          weight: 1,
          visibility: 4,
          extension_attributes: {
            stock_item: {
              qty: product.quantity,
              is_in_stock: true,
            },
          },
          custom_attributes: [
            {
              attribute_code: 'description',
              value: product.description,
            },
          ],
        },
      };

      try {
        const exists = await this.magentoService.productExists(sku, accessToken);
        if (!exists) {
          await this.magentoService.createProduct(productData, accessToken);
          console.log(`Produto inserido: ${product.name}`);
        } else {
          console.log(`Produto já existe: ${product.name}`);
        }
      } catch (error) {
        console.error(`Erro ao inserir produto ${product.name}: ${error.message}`);
      }
    }
  }
}
