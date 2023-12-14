import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {AimsDbDataSource} from '../datasources';
import {User, UserRelations, Order, Cart} from '../models';
import {OrderRepository} from './order.repository';
import {CartRepository} from './cart.repository';

export type Credentials = {
  username: string;
  password: string;
}

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly orders: HasManyRepositoryFactory<Order, typeof User.prototype.id>;

  public readonly cart: HasOneRepositoryFactory<Cart, typeof User.prototype.id>;

  constructor(
    @inject('datasources.AIMS_db') dataSource: AimsDbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('CartRepository') protected cartRepositoryGetter: Getter<CartRepository>,
  ) {
    super(User, dataSource);
    this.cart = this.createHasOneRepositoryFactoryFor('cart', cartRepositoryGetter);
    this.registerInclusionResolver('cart', this.cart.inclusionResolver);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);

  }
}
