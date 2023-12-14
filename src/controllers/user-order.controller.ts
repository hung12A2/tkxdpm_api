import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {
  Order,
  User,
} from '../models';
import {CartRepository, OrderRepository, ProductRepository, UserRepository} from '../repositories';

export class UserOrderController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(ProductRepository) protected productRepository: ProductRepository,
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) { }

  @get('/users/{id}/orders', {
    responses: {
      '200': {
        description: 'Array of User has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.userRepository.orders(id).find(filter);
  }

  @post('/users/{id}/orders', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInUser',
            exclude: ['id', 'idOfUser', 'totalPrice'],
            optional: ['idOfUser']
          }),
        },
      },
    }) order: Omit<Order, 'id'>,
  ): Promise<any> {

    order.idOfUser = id ? id : "";
    const shippingPrice = order.shippingPrice ? order.shippingPrice : 0;
    let cartTotalPrice = (await this.userRepository.cart(id).get()).totalPrice;
    cartTotalPrice = cartTotalPrice ? cartTotalPrice : 0;
    order.totalPrice = shippingPrice + cartTotalPrice;
    const newOrder = await this.userRepository.orders(id).create(order);
    const cartid = (await (this.userRepository.cart(id).get())).id;
    const productincarts = await this.cartRepository.productincarts(cartid).find();
    await this.cartRepository.productincarts(cartid).delete();
    await Promise.all(productincarts.map(async (productincart) => {
      const product = await this.productRepository.findById(productincart.idOfProduct);
      await this.orderRepository.productinorders(newOrder.id).create({
        idOfOrder: newOrder.id,
        idOfProduct: product.id,
        quantity: productincart.quantity
      })

    }))

    return this.userRepository.orders(id).find({where: {idOfUser: id}});
  }

  @patch('/users/{id}/orders', {
    responses: {
      '200': {
        description: 'User.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Partial<Order>,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.userRepository.orders(id).patch(order, where);
  }

}
