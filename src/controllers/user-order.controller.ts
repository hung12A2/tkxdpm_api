import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {CountSchema, Filter, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {Order} from '../models';
import {
  CartRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from '../repositories';
import {basicAuthorization} from '../services';
import {RestBindings} from '@loopback/rest';
import {Response} from '@loopback/rest';
import moment from 'moment';
import { Request } from '@loopback/rest';
import { CONFIG_VNPAY } from './vnPay/config';
import { sortObject } from './vnPay/utils';
import qs from 'qs'
import crypto from 'crypto'


export class UserOrderController {
  constructor(
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(ProductRepository)
    protected productRepository: ProductRepository,
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @get('/users/orders', {
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
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    const orders = await this.userRepository.orders(id).find(filter);
    const listOrderReturn = await Promise.all(
      orders.map(async order => {
        const productInOrders = await this.orderRepository
          .productinorders(order.id)
          .find();
        const products = await Promise.all(
          productInOrders.map(async productInOrder => {
            const product = await this.productRepository.findById(
              productInOrder.idOfProduct,
            );
            return {
              ...product,
              quantity: productInOrder.quantity,
              totalPrice: productInOrder.quantity * product.price,
            };
          }),
        );
        return {
          ...order,
          products: products,
        };
      }),
    );

    return listOrderReturn;
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @get('/users/orders/{idOfOrder}', {
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
  async findById(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('idOfOrder') idOfOrder: string,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    const orders = await this.userRepository
      .orders(id)
      .find({where: {id: idOfOrder}});
    const listOrderReturn = await Promise.all(
      orders.map(async order => {
        const productInOrders = await this.orderRepository
          .productinorders(order.id)
          .find();
        const products = await Promise.all(
          productInOrders.map(async productInOrder => {
            const product = await this.productRepository.findById(
              productInOrder.idOfProduct,
            );
            return {
              ...product,
              quantity: productInOrder.quantity,
              totalPrice: productInOrder.quantity * product.price,
            };
          }),
        );
        return {
          ...order,
          products: products,
        };
      }),
    );

    return listOrderReturn;
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @post('/users/orders', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInUser',
            exclude: ['id', 'idOfUser', 'totalPrice'],
            optional: ['idOfUser'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    order.idOfUser = id ? id : '';
    const shippingPrice = order.shippingPrice ? order.shippingPrice : 0;
    let cartTotalPrice = (await this.userRepository.cart(id).get()).totalPrice;
    cartTotalPrice = cartTotalPrice ? cartTotalPrice : 0;
    order.totalPrice = shippingPrice + cartTotalPrice;
    const newOrder = await this.userRepository.orders(id).create(order);
    const cartid = (await this.userRepository.cart(id).get()).id;
    const productincarts = await this.cartRepository
      .productincarts(cartid)
      .find();
    await this.cartRepository.productincarts(cartid).delete();
    await this.cartRepository.updateById(cartid, {totalPrice: 0});
    await Promise.all(
      productincarts.map(async productincart => {
        const product = await this.productRepository.findById(
          productincart.idOfProduct,
        );
        await this.productRepository.updateById(product.id, {
          countInStock: product.countInStock - productincart.quantity,
        });
        await this.orderRepository.productinorders(newOrder.id).create({
          idOfOrder: newOrder.id,
          idOfProduct: product.id,
          quantity: productincart.quantity,
        });
      }),
    );
    return this.userRepository.orders(id).find({where: {idOfUser: id}});
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @patch('/users/orders/{idOfOrder}/canceled', {
    responses: {
      '200': {
        description: 'User.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('idOfOrder') idOfOrder: string,
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    await this.userRepository
      .orders(id)
      .patch({isAccepted: false}, {id: idOfOrder, idOfUser: id});
    const productInOrders = await this.orderRepository
      .productinorders(idOfOrder)
      .find();
    const productInOrdersId = productInOrders.map(
      productInOrder => productInOrder.id,
    );
    await this.orderRepository
      .productinorders(idOfOrder)
      .patch({isAccepted: false}, {id: {inq: productInOrdersId}});
    await Promise.all(
      productInOrders.map(async productInOrder => {
        const product = await this.productRepository.findById(
          productInOrder.idOfProduct,
        );
        this.productRepository.updateById(product.id, {
          countInStock: product.countInStock + productInOrder.quantity,
        });
      }),
    );
    return await this.orderRepository.findById(idOfOrder);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @patch('/orders/{idOfOrder}/canceled', {
    responses: {
      '200': {
        description: 'User.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patchByAdmin(
    @param.path.string('idOfOrder') idOfOrder: string,
  ): Promise<any> {
    await this.orderRepository.updateById(idOfOrder, {isAccepted: false});
    const productInOrders = await this.orderRepository
      .productinorders(idOfOrder)
      .find();
    const productInOrdersId = productInOrders.map(
      productInOrder => productInOrder.id,
    );
    await this.orderRepository
      .productinorders(idOfOrder)
      .patch({isAccepted: false}, {id: {inq: productInOrdersId}});
    await Promise.all(
      productInOrders.map(async productInOrder => {
        const product = await this.productRepository.findById(
          productInOrder.idOfProduct,
        );
        this.productRepository.updateById(product.id, {
          countInStock: product.countInStock + productInOrder.quantity,
        });
      }),
    );
    return await this.orderRepository.findById(idOfOrder);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @get('/orders', {
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
  async findByAdmin(
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<any> {
    const orders = await this.orderRepository.find();
    const listOrderReturn = await Promise.all(
      orders.map(async order => {
        const productInOrders = await this.orderRepository
          .productinorders(order.id)
          .find();
        const products = await Promise.all(
          productInOrders.map(async productInOrder => {
            const product = await this.productRepository.findById(
              productInOrder.idOfProduct,
            );
            return {
              ...product,
              quantity: productInOrder.quantity,
              totalPrice: productInOrder.quantity * product.price,
            };
          }),
        );
        return {
          ...order,
          products: products,
        };
      }),
    );

    this.response.header('Access-Control-Expose-Headers', 'Content-Range');
    return this.response
      .header('Content-Range', 'orders 0-20/20')
      .send(listOrderReturn);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @get('/orders/{idOfOrder}', {
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
  async find1OrderByAdmin(
    @param.path.string('idOfOrder') idOfOrder: string,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<any> {
    const orders = await this.orderRepository.find({where: {id: idOfOrder}});
    const listOrderReturn = await Promise.all(
      orders.map(async order => {
        const productInOrders = await this.orderRepository
          .productinorders(order.id)
          .find();
        const products = await Promise.all(
          productInOrders.map(async productInOrder => {
            const product = await this.productRepository.findById(
              productInOrder.idOfProduct,
            );
            return {
              ...product,
              quantity: productInOrder.quantity,
              totalPrice: productInOrder.quantity * product.price,
            };
          }),
        );
        return {
          ...order,
          products: products,
        };
      }),
    );

    return listOrderReturn;
  }


  // vnpay 
  @post('user/order/pay', {
    responses: {
      '200': {
        description: 'Return pay informaion',
      },
    },
  })
  testPay(
    @requestBody({
      description: 'testVnpay',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['amount_money'],
            properties: {
              amount_money: {
                type: 'number',
              },
            },
          },
        },
      },
    })
    data: any,
  ): String {
    const now = new Date();
    const createDate = moment(now).format('YYYYMMDDHHmmss');
    const ip_Addr = this.request.ip;
    const tmnCode = CONFIG_VNPAY.vnp_TmnCode;
    const secretKey = CONFIG_VNPAY.vnp_HashSecret;
    let vnpUrl = CONFIG_VNPAY.vnp_Url;
    // trang tro ve sau khi thanh toan 
    const returnUrl = CONFIG_VNPAY.vnp_ReturnUrl;
    const orderId = moment(now).format('DDHHmmss');
    const amount = parseInt(data.amount_money, 10) || 0;
    const locale = CONFIG_VNPAY.vnp_Locale;
    const currCode = CONFIG_VNPAY.vnp_CurrCode;
    let vnp_Params: Record<string, any> = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ip_Addr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, {encode: false});
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, {encode: false});

    return vnpUrl;
  }
}
