import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  put,
  requestBody,
  response
} from '@loopback/rest';
import {Product} from '../models';
import {CategoryRepository, ProductRepository} from '../repositories';

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository
  ) { }

  @post('/products/{idOfCategory}', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Product)}},
      },
    },
  })
  async createProduct(
    @param.path.string('idOfCategory') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInCategory',
            exclude: ['id', 'cateName', 'idOfCategory'],
            optional: ['idOfCategory']
          }),
        },
      },
    }) product: Omit<Product, 'id' | 'idOfCategory'>,
  ): Promise<Product> {
    product.cateName = (await this.categoryRepository.findById(id)).cateName;
    return this.categoryRepository.products(id).create(product);
  }

  @get('/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find(filter);
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Product, {exclude: 'where'}) filter?: FilterExcludingWhere<Product>
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }


  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() product: Product,
  ): Promise<void> {
    await this.productRepository.replaceById(id, product);
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.productRepository.deleteById(id);
  }
}
