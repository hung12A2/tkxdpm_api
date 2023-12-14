import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {AimsDbDataSource} from '../datasources';
import {Cart, CartRelations, Productincart} from '../models';
import {ProductincartRepository} from './productincart.repository';

export class CartRepository extends DefaultCrudRepository<
  Cart,
  typeof Cart.prototype.id,
  CartRelations
> {

  public readonly productincarts: HasManyRepositoryFactory<Productincart, typeof Cart.prototype.id>;

  constructor(
    @inject('datasources.AIMS_db') dataSource: AimsDbDataSource, @repository.getter('ProductincartRepository') protected productincartRepositoryGetter: Getter<ProductincartRepository>,
  ) {
    super(Cart, dataSource);
    this.productincarts = this.createHasManyRepositoryFactoryFor('productincarts', productincartRepositoryGetter,);
    this.registerInclusionResolver('productincarts', this.productincarts.inclusionResolver);
  }
}
