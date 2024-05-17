import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MagentoService {
  private readonly logger = new Logger(MagentoService.name);

  constructor(private httpService: HttpService) {}

  async getAccessToken(username: string, password: string): Promise<string> {
    const url = `${process.env.MAGENTO_API_URL}/integration/admin/token`;
    const body = { username, password };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          'Failed to obtain access token: ' + error.response.data.message,
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw new HttpException(
          'Failed to obtain access token: ' + error.message,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async createProduct(productData: any, accessToken: string): Promise<any> {
    const url = `${process.env.MAGENTO_API_URL}/products`;

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, productData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to create product: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async productExists(sku: string, accessToken: string): Promise<boolean> {
    const url = `${process.env.MAGENTO_API_URL}/products/${sku}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return !!response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      } else {
        throw new HttpException(
          'Failed to check product existence: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async createTestCustomer(): Promise<any> {
    const url = `${process.env.MAGENTO_API_URL}/customers`;
    const customerData = {
      customer: {
        email: 'testuser@example.com',
        firstname: 'Test',
        lastname: 'User',
        store_id: 1,
        website_id: 1,
      },
      password: 'TestPassword123',
    };
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, customerData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
          },
        }),
      );
      this.logger.log('Cliente de teste criado:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'createTestCustomer');
    }
  }

  async getCustomerToken(username: string, password: string): Promise<string> {
    const url = `${process.env.MAGENTO_API_URL}/integration/customer/token`;
    const body = { username, password };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          'Failed to obtain customer token: ' + error.response.data.message,
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw new HttpException(
          'Failed to obtain customer token: ' + error.message,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  private handleError(error: any, methodName: string): void {
    if (error.response) {
      this.logger.error(`${methodName} - Erro na resposta da API:`, error.response.data);
      throw new HttpException(error.response.data, error.response.status);
    } else {
      this.logger.error(`${methodName} - Erro na requisição:`, error.message);
      throw new HttpException('Erro na comunicação com a API Magento', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
