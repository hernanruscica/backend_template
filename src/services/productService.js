import BaseService from './baseService.js';
import { ProductModel } from '../models/productModel.js';

const ProductService = BaseService(ProductModel);

// If you need to add specific logic for products, you can extend the service like this:
// const ProductService = {
//   ...BaseService(ProductModel),
//   async yourCustomMethod(args) {
//     // Your custom logic here
//   }
// };

export default ProductService;
