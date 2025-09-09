import BaseController from './baseController.js';
import ProductService from '../services/productService.js';

const ProductController = BaseController(ProductService);

export default ProductController;
