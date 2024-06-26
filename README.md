
# Magento Fake Products Service

Este serviço é responsável por gerar e inserir produtos fictícios em uma instância do Magento, usando uma API REST. O serviço é desenvolvido com NestJS.

## Estrutura do Projeto

```
/magento-fake-products
├── node_modules/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   └── services/
│   │       └── magento.service.ts
│   ├── product/
│   │   ├── product.module.ts
│   │   ├── product.service.ts
│   │   └── product.controller.ts
├── .env
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```
MAGENTO_ADMIN_USERNAME=user
MAGENTO_ADMIN_PASSWORD=bitnami1
NUM_PRODUCTS=10
MAGENTO_API_URL=http://localhost:8080/rest/V1
```

```bash
npm install
```
### Inicialização do Servidor

```bash
npm run start:dev
```
O serviço cria automaticamente produtos fictícios ao iniciar conforme quantidade configurada no env. Valida duplicações por SKU.

### MagentoService

Comunica com a API do Magento. métodos:

- `getAccessToken(username: string, password: string): Promise<string>`: Obtém um token de acesso usando as credenciais do administrador.
- `createProduct(productData: any, accessToken: string): Promise<any>`: Cria um novo produto no Magento.
- `productExists(sku: string, accessToken: string): Promise<boolean>`: Verifica se um produto com o SKU especificado já existe.

### ProductService

Gera produtos fictícios usando a lib [Faker](https://fakerjs.dev/guide/) e verifica sua existência antes de criá-los. métodos:

- `generateProducts(numProducts: number)`: Gera um array de produtos fictícios.
- `createFakeProducts(numProducts: number)`: Obtém um token de acesso, gera produtos fictícios e cria novos produtos no Magento, verificando a existência de cada produto antes de criá-lo.
