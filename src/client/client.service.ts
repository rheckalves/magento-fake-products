import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private adminToken: string;

  constructor(private httpService: HttpService) {}

  async getAdminToken(): Promise<string> {
    if (this.adminToken) {
      return this.adminToken;
    }

    const url = `${process.env.MAGENTO_API_URL}/integration/admin/token`;
    const body = {
      username: process.env.MAGENTO_ADMIN_USERNAME,
      password: process.env.MAGENTO_ADMIN_PASSWORD,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      this.adminToken = response.data;
      return this.adminToken;
    } catch (error) {
      this.logger.error('Erro ao obter o token de administração:', error.response ? error.response.data : error.message);
      throw new HttpException(
        'Failed to obtain admin token: ' + (error.response?.data?.message || error.message),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async createOrUpdateTestCustomer(): Promise<any> {
    const customerEmail = 'testuser@example.com';
    const customerData = {
      customer: {
        email: customerEmail,
        firstname: 'Test',
        lastname: 'User',
        store_id: 1,
        website_id: 1,
        addresses: [
          {
            default_shipping: true,
            default_billing: true,
            firstname: 'Test',
            lastname: 'User',
            region_id: 12,
            postcode: '90001',
            street: ['123 Test St'], 
            city: 'Los Angeles',
            telephone: '555-555-5555',
            country_id: 'US'
          }
        ]
      },
      password: 'TestPassword123',
    };

    try {
      const adminToken = await this.getAdminToken();

      // Verificar se o cliente já existe
      const existingCustomer = await this.getCustomerByEmail(customerEmail, adminToken);
      if (existingCustomer) {
        // Atualizar informações do cliente existente
        const updatedCustomer = await this.updateCustomer(existingCustomer.id, customerData.customer, adminToken);
        this.logger.log('Cliente de teste atualizado:', updatedCustomer);
        return updatedCustomer;
      } else {
        // Criar novo cliente
        const response = await lastValueFrom(
          this.httpService.post(`${process.env.MAGENTO_API_URL}/customers`, customerData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
          }),
        );
        this.logger.log('Cliente de teste criado:', response.data);
        return response.data;
      }
    } catch (error) {
      this.handleError(error, 'createOrUpdateTestCustomer');
    }
  }

  async getCustomerByEmail(email: string, adminToken: string): Promise<any> {
    const url = `${process.env.MAGENTO_API_URL}/customers/search?searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=${email}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
    try {
      const response = await lastValueFrom(this.httpService.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }));
      this.logger.log('Resposta da API ao buscar cliente por email:', response.data);
      return response.data.items.length ? response.data.items[0] : null;
    } catch (error) {
      this.logger.error('Erro ao buscar cliente por email:', error.response ? error.response.data : error.message);
      this.handleError(error, 'getCustomerByEmail');
    }
  }

  async updateCustomer(customerId: number, customerData: any, adminToken: string): Promise<any> {
    const url = `${process.env.MAGENTO_API_URL}/customers/${customerId}`;
    try {
      this.logger.log('Dados do cliente para atualização:', JSON.stringify(customerData, null, 2));
      const response = await lastValueFrom(
        this.httpService.put(url, { customer: customerData }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'updateCustomer');
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
      this.logger.error('Status:', error.response.status);
      this.logger.error('Headers:', JSON.stringify(error.response.headers));
      this.logger.error('Data:', JSON.stringify(error.response.data));
      throw new HttpException(error.response.data, error.response.status);
    } else {
      this.logger.error(`${methodName} - Erro na requisição:`, error.message);
      throw new HttpException('Erro na comunicação com a API Magento', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
