
import { Product } from '../models/product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy
  } = req.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    search,
    sortBy
  };

  const result = await Product.getAll(filters);
  const totalPages = Math.ceil(result.total / filters.limit);

  res.json({
    success: true,
    page: filters.page,
    totalPages,
    totalProducts: result.total,
    products: result.products
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    product
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.getCategories();

  res.json({
    success: true,
    categories
  });
});
