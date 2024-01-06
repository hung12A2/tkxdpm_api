import {Entity, model, property} from '@loopback/repository';

@model()
export class Product extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  image: string;

  @property({
    type: 'string',
    required: true,
  })
  idOfCategory: string;

  @property({
    type: 'string',
    required: true,
  })
  productDescription: string;

  @property({
    type: 'string',
    required: true,
  })
  productDetails: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'number',
    required: true,
  })
  countInStock: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isBestSeller: boolean;

  @property({
    type: 'string',
    required: true,
  })
  cateName: string;

  @property({
    type: 'boolean',
    required: false,
    default: false
  })
  isDeleted: boolean;


  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
