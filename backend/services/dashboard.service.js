import Product from '../models/product.model.js';

const LOW_STOCK_THRESHOLD = 10;

export const getDashboardStats = async (userId) => {
  const [result] = await Product.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ['$stock', LOW_STOCK_THRESHOLD] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        totalValue: 1,
        lowStockCount: 1,
      },
    },
  ]);

  return result ?? { totalProducts: 0, totalValue: 0, lowStockCount: 0 };
};
