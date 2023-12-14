import {Entity, model, property, hasMany} from '@loopback/repository';
import {Productinorder} from './productinorder.model';

@model()
export class Order extends Entity {
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
  idOfUser: string;

  @property({
    type: 'string',
    required: true,
  })
  shippingAddress: string;

  @property({
    type: 'string',
    required: true,
  })
  paymentMethod: string;

  @property({
    type: 'number',
    default: 0,
  })
  shippingPrice?: number;

  @property({
    type: 'number',
    default: 0,
  })
  totalPrice?: number;

  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  isAccepted: boolean;

  @hasMany(() => Productinorder, {keyTo: 'idOfOrder'})
  productinorders: Productinorder[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
