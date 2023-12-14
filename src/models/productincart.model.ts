import {Entity, model, property} from '@loopback/repository';

@model()
export class Productincart extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  idOfCart: string;

  @property({
    type: 'string',
    required: true,
  })
  idOfProduct: string;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;


  constructor(data?: Partial<Productincart>) {
    super(data);
  }
}

export interface ProductincartRelations {
  // describe navigational properties here
}

export type ProductincartWithRelations = Productincart & ProductincartRelations;
