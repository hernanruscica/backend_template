import BaseModel from './baseModel.js';

const allowedFields = ['name', 'description', 'price', 'business_uuid'];
const ProductModel = BaseModel('products', allowedFields);

export { ProductModel };
