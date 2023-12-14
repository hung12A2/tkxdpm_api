import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Order,
  Productinorder,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderProductinorderController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/productinorders', {
    responses: {
      '200': {
        description: 'Array of Order has many Productinorder',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Productinorder)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Productinorder>,
  ): Promise<Productinorder[]> {
    return this.orderRepository.productinorders(id).find(filter);
  }

  @post('/orders/{id}/productinorders', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Productinorder)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productinorder, {
            title: 'NewProductinorderInOrder',
            exclude: ['id'],
            optional: ['idOfOrder']
          }),
        },
      },
    }) productinorder: Omit<Productinorder, 'id'>,
  ): Promise<Productinorder> {
    return this.orderRepository.productinorders(id).create(productinorder);
  }

  @patch('/orders/{id}/productinorders', {
    responses: {
      '200': {
        description: 'Order.Productinorder PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productinorder, {partial: true}),
        },
      },
    })
    productinorder: Partial<Productinorder>,
    @param.query.object('where', getWhereSchemaFor(Productinorder)) where?: Where<Productinorder>,
  ): Promise<Count> {
    return this.orderRepository.productinorders(id).patch(productinorder, where);
  }

  @del('/orders/{id}/productinorders', {
    responses: {
      '200': {
        description: 'Order.Productinorder DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Productinorder)) where?: Where<Productinorder>,
  ): Promise<Count> {
    return this.orderRepository.productinorders(id).delete(where);
  }
}
