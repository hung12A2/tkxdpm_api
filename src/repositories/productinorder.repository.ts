import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AimsDbDataSource} from '../datasources';
import {Productinorder, ProductinorderRelations} from '../models';

export class ProductinorderRepository extends DefaultCrudRepository<
  Productinorder,
  typeof Productinorder.prototype.id,
  ProductinorderRelations
> {
  constructor(
    @inject('datasources.AIMS_db') dataSource: AimsDbDataSource,
  ) {
    super(Productinorder, dataSource);
  }
}
