import {
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  post,
  requestBody
} from '@loopback/rest';
import {
  Cart,
  Productincart,
} from '../models';
import {CartRepository, ProductRepository} from '../repositories';

export class CartProductincartController {
  constructor(
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(ProductRepository) protected productRepository: ProductRepository,
  ) { }

  @get('/carts/{id}/productincarts', {
    responses: {
      '200': {
        description: 'Array of Cart has many Productincart',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Productincart)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Productincart>,
  ): Promise<any> {
    const cart = await this.cartRepository.findById(id)
    const listProductInCart = this.cartRepository.productincarts(id).find();
    const listProduct = await Promise.all((await listProductInCart).map(async (productInCart) => {
      const product = await this.productRepository.findById(productInCart.idOfCart);
      return {
        ...product,
        quantity: productInCart.quantity,
        totalPrice: (productInCart.quantity * (await product).price)
      }
    }))

    return {
      ...cart,
      products: listProduct
    }
  }

  @post('/carts/{id}/{idOfProduct}/productincarts', {
    responses: {
      '200': {
        description: 'Cart model instance',
        content: {'application/json': {schema: getModelSchemaRef(Productincart)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Cart.prototype.id,
    @param.path.string('idOfProduct') idOfProduct: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productincart, {
            title: 'NewProductincartInCart',
            exclude: ['id', 'idOfCart', 'idOfProduct'],
            optional: ['idOfCart']
          }),
        },
      },
    }) productincart: Omit<Productincart, 'id'>,
  ): Promise<any> {
    productincart.idOfCart = id ? id : ""
    productincart.idOfProduct = idOfProduct;
    const product = await this.productRepository.findById(idOfProduct);
    const oldCart = await this.cartRepository.findById(id);
    let oldtotalPrice = oldCart.totalPrice
    oldtotalPrice = oldtotalPrice ? oldtotalPrice : 0;
    const productArray = await this.cartRepository.productincarts(id).find({where: {idOfProduct: idOfProduct}})

    if (productArray.length == 0) {
      const newtotalPrice = (oldtotalPrice + productincart.quantity * product.price);
      const newCart = Object.assign({totalPrice: newtotalPrice})
      await this.cartRepository.updateById(id, newCart);
      await this.cartRepository.productincarts(id).create(productincart)
    } else {
      const newtotalPrice = (oldtotalPrice + (productincart.quantity - productArray[0].quantity) * product.price)
      const newCart = Object.assign({totalPrice: newtotalPrice})
      await this.cartRepository.updateById(id, newCart);
      await this.cartRepository.productincarts(id).patch(productincart, {idOfCart: id, idOfProduct: idOfProduct})
    }
    return await this.cartRepository.findById(id);
  }


  @del('/carts/{id}/productincarts', {
    responses: {
      '200': {
        description: 'Cart.Productincart DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Productincart)) where?: Where<Productincart>,
  ): Promise<any> {
    await this.cartRepository.updateById(id, {totalPrice: 0});
    await this.cartRepository.productincarts(id).delete(where);
    return this.cartRepository.findById(id)
  }
}
