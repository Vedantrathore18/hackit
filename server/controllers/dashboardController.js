import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import { generateDynamicInsightsWithAI } from '../services/openaiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get dashboard metrics, aggregations, and dynamic AI munim insights
 * @route   GET /api/dashboard/summary
 * @access  Public
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Run all aggregation pipelines concurrently
  const [
    expected7DaysAgg,
    overdueAgg,
    todayCollectionAgg,
    todaySalesAgg,
    totalCustomerCount,
    topOverdueCustomers,
  ] = await Promise.all([
    // 1. Expected next 7 days pending udhaar
    Transaction.aggregate([
      {
        $match: {
          type: 'udhaar',
          status: 'pending',
          due_date: { $gte: now, $lte: in7Days },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // 2. Overdue pending udhaar
    Transaction.aggregate([
      {
        $match: {
          type: 'udhaar',
          status: 'pending',
          due_date: { $lt: now, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          customer_ids: { $addToSet: '$customer_id' },
        },
      },
    ]),

    // 3. Today's payments collected
    Transaction.aggregate([
      {
        $match: {
          type: 'payment',
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. Today's counter sales
    Transaction.aggregate([
      {
        $match: {
          type: 'sale',
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // 5. Total customers registered
    Customer.countDocuments(),

    // 6. Top overdue accounts
    Customer.find({ total_outstanding: { $gt: 0 } })
      .sort({ total_outstanding: -1 })
      .limit(5)
      .select('name phone total_outstanding updatedAt'),
  ]);

  const total_expected_7_days = expected7DaysAgg[0]?.total || 0;
  const total_overdue = overdueAgg[0]?.total || 0;
  const overdue_customer_count = overdueAgg[0]?.customer_ids?.length || 0;
  const today_collection = todayCollectionAgg[0]?.total || 0;
  const today_sales = todaySalesAgg[0]?.total || 0;

  // Generate dynamic AI Insights based on calculated numbers
  const ai_insights = await generateDynamicInsightsWithAI({
    totalExpected7Days: total_expected_7_days,
    totalOverdue: total_overdue,
    todayCollection: today_collection,
    overdueCount: overdue_customer_count,
  });

  res.json({
    success: true,
    data: {
      metrics: {
        total_expected_7_days,
        total_overdue,
        overdue_customer_count,
        today_collection,
        today_sales,
        today_total_inflow: today_collection + today_sales,
        total_customers: totalCustomerCount,
      },
      ai_insights,
      top_overdue_accounts: topOverdueCustomers,
      timestamp: now.toISOString(),
    },
  });
});
