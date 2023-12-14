import {Entity, model, property} from '@loopback/repository';

@model()
export class Productinorder extends Entity {
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
  idOfOrder: string;

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


  constructor(data?: Partial<Productinorder>) {
    super(data);
  }
}

export interface ProductinorderRelations {
  // describe navigational properties here
}

export type ProductinorderWithRelations = Productinorder & ProductinorderRelations;
