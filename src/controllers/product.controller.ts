import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Product} from '../models';
import {CategoryRepository, ProductRepository} from '../repositories';
import {basicAuthorization} from '../services';
import {inject} from '@loopback/core';
import {RestBindings} from '@loopback/rest';
import {Response} from '@loopback/rest';
import {checkValidLength} from '../services/checkValid';

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
  ) {}

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @post('/products/', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Product)}},
      },
    },
  })
  async createProduct(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInCategory',
            exclude: ['id', 'cateName'],
            optional: ['idOfCategory'],
          }),
        },
      },
    })
    product: Omit<Product, 'id'>,
  ): Promise<any> {

    if (!checkValidLength(product.name, 50)) {
      return this.response
        .status(422)
        .send({message: 'Đã vượt quá 50 kí tự rồi'});
    }

    if (
      (
        await this.productRepository.find({
          where: {name: product.name},
        })
      ).length > 0
    )
      return this.response
        .status(422)
        .send({message: 'Đã tồn tại product này rồi '});

    product.cateName = (
      await this.categoryRepository.findById(product.idOfCategory)
    ).cateName;

    return this.categoryRepository
      .products(product.idOfCategory)
      .create(product);
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
  async find(@param.filter(Product) filter?: Filter<Product>): Promise<any> {
    const data = await this.productRepository.find(filter);
    this.response.header('Access-Control-Expose-Headers', 'Content-Range');
    return this.response.header('Content-Range', 'products 0-20/20').send(data);
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
    @param.filter(Product, {exclude: 'where'})
    filter?: FilterExcludingWhere<Product>,
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() product: Omit<Product, 'id'>,
  ): Promise<any> {
    if (!checkValidLength(product.name, 50)) {
      return this.response
        .status(422)
        .send({message: 'Đã vượt quá 50 kí tự rồi'});
    }

    if (
      (
        await this.productRepository.find({
          where: {name: product.name},
        })
      ).length > 0
    )
      return this.response
        .status(422)
        .send({message: 'Đã tồn tại product này rồi '});

    product.cateName = (
      await this.categoryRepository.findById(product.idOfCategory)
    ).cateName;
    product.cateName = (
      await this.categoryRepository.findById(product.idOfCategory)
    ).cateName;
    await this.productRepository.replaceById(id, product);
    return this.productRepository.findById(id);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @put('/products/{id}/del')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<any> {
    await this.productRepository.updateById(id, {isDeleted: true});
    return this.productRepository.findById(id);
  }
}
