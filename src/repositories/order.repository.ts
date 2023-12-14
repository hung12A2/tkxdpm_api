import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {AimsDbDataSource} from '../datasources';
import {Order, OrderRelations, Productinorder} from '../models';
import {ProductinorderRepository} from './productinorder.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly productinorders: HasManyRepositoryFactory<Productinorder, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.AIMS_db') dataSource: AimsDbDataSource, @repository.getter('ProductinorderRepository') protected productinorderRepositoryGetter: Getter<ProductinorderRepository>,
  ) {
    super(Order, dataSource);
    this.productinorders = this.createHasManyRepositoryFactoryFor('productinorders', productinorderRepositoryGetter,);
    this.registerInclusionResolver('productinorders', this.productinorders.inclusionResolver);
  }
}
