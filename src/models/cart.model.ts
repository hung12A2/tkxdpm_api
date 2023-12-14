import {Entity, model, property, hasMany} from '@loopback/repository';
import {Productincart} from './productincart.model';

@model()
export class Cart extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'number',
    default: 0,
  })
  totalPrice?: number;

  @property({
    type: 'string',
  })
  idOfUser?: string;

  @hasMany(() => Productincart, {keyTo: 'idOfCart'})
  productincarts: Productincart[];

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}

export interface CartRelations {
  // describe navigational properties here
}

export type CartWithRelations = Cart & CartRelations;
