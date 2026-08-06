import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import DashboardCharts from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  await connectDB();

  const today = startOfDay(new Date());

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const fourteenAgo = new Date(today);
  fourteenAgo.setDate(fourteenAgo.getDate() - 13);

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    pendingCount,
    last14Orders,
    topProducts,
    lowStock,
  ] = await Promise.all([
    Order.find({
      createdAt: { $gte: today },
      status: { $ne: "Cancelled" },
    }).lean(),

    Order.find({
      createdAt: { $gte: weekAgo },
      status: { $ne: "Cancelled" },
    }).lean(),

    Order.find({
      createdAt: { $gte: monthAgo },
      status: { $ne: "Cancelled" },
    }).lean(),

    Order.countDocuments({
      status: "Pending",
    }),

    Order.find({
      createdAt: { $gte: fourteenAgo },
      status: { $ne: "Cancelled" },
    }).lean(),

    Product.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .lean(),

    Product.find({
      $expr: {
        $lte: ["$stock", "$lowStockAlertAt"],
      },
    })
      .limit(5)
      .lean(),
  ]);

  const totalSales = (orders) =>
    orders.reduce((sum, order) => sum + order.total, 0);

  // Chart Data
  const chartMap = {};

  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenAgo);
    d.setDate(d.getDate() + i);

    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

    chartMap[key] = 0;
  }

  last14Orders.forEach((order) => {
    const d = new Date(order.createdAt);

    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

    if (chartMap[key] !== undefined) {
      chartMap[key] += order.total;
    }
  });

  const chartData = Object.entries(chartMap).map(([date, total]) => ({
    date,
    total,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">

      {/* Header */}

      <div className="mb-8">
        <h1 className="font-display text-4xl text-maroon">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back — here's how Rani's Cook House is doing.
        </p>
      </div>

      {/* Dashboard Cards */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">
          <p className="text-gray-500">Today's Sales</p>

          <h2 className="mt-3 font-display text-4xl text-maroon">
            ₹{totalSales(todayOrders)}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {todayOrders.length} Orders
          </p>
        </div>

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">
          <p className="text-gray-500">Weekly Sales</p>

          <h2 className="mt-3 font-display text-4xl text-maroon">
            ₹{totalSales(weekOrders)}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {weekOrders.length} Orders
          </p>
        </div>

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">
          <p className="text-gray-500">Monthly Sales</p>

          <h2 className="mt-3 font-display text-4xl text-maroon">
            ₹{totalSales(monthOrders)}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {monthOrders.length} Orders
          </p>
        </div>

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">
          <p className="text-gray-500">Pending Orders</p>

          <h2 className="mt-3 font-display text-4xl text-maroon">
            {pendingCount}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Need Action
          </p>
        </div>

      </div>

      {/* Sales Chart */}

      <div className="mt-8 rounded-2xl border border-stoneline bg-white p-6 shadow-sm">

        <h2 className="mb-5 font-display text-2xl text-maroon">
          Sales Trend (Last 14 Days)
        </h2>

        <DashboardCharts data={chartData} />

      </div>

      {/* Bottom Section */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Top Selling */}

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">

          <h2 className="mb-5 font-display text-2xl text-maroon">
            Top Selling Products
          </h2>

          {topProducts.filter((p) => p.soldCount > 0).length === 0 ? (
            <p className="text-sm text-gray-500">
              No sales yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {topProducts
                .filter((p) => p.soldCount > 0)
                .map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <span>{p.name}</span>

                    <span className="font-semibold text-maroon">
                      {p.soldCount} Sold
                    </span>
                  </li>
                ))}
            </ul>
          )}

        </div>

        {/* Low Stock */}

        <div className="rounded-2xl border border-stoneline bg-white p-6 shadow-sm">

          <h2 className="mb-5 font-display text-2xl text-maroon">
            Low Stock Alert
          </h2>

          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">
              All products are well stocked.
            </p>
          ) : (
            <ul className="space-y-4">
              {lowStock.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <span>{p.name}</span>

                  <span className="font-semibold text-red-600">
                    {p.stock} Left
                  </span>
                </li>
              ))}
            </ul>
          )}

        </div>

      </div>

    </div>
  );
}