import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AimsDbDataSource} from '../datasources';
import {Productincart, ProductincartRelations} from '../models';

export class ProductincartRepository extends DefaultCrudRepository<
  Productincart,
  typeof Productincart.prototype.id,
  ProductincartRelations
> {
  constructor(
    @inject('datasources.AIMS_db') dataSource: AimsDbDataSource,
  ) {
    super(Productincart, dataSource);
  }
}
