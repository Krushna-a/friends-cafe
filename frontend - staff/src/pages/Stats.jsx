import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Stats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/stats?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className="h-screen bg-white p-4 mt-2 flex items-center justify-center">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-screen bg-white p-4 mt-2 flex items-center justify-center">
        <div className="text-gray-500">No statistics available</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-4 mt-2 w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Statistics Dashboard</h2>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={fetchStats}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.summary.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Profit</div>
            <div className="text-2xl font-bold text-blue-600">
              ₹{stats.summary.profit.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (30% margin)
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.summary.totalOrders}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.summary.paidOrders} paid, {stats.summary.pendingOrders} pending
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.summary.totalCustomers}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.summary.newCustomers} new this {period}
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {period === "month" ? "Monthly" : period === "day" ? "Daily" : period === "week" ? "Weekly" : "Yearly"} Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={
                  period === "month"
                    ? stats.monthlyStats
                    : stats.dailyStats.length > 0
                    ? stats.dailyStats
                    : [{ date: "No data", revenue: 0, profit: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={period === "month" ? "month" : "date"}
                  tick={{ fontSize: 12 }}
                  angle={period === "month" ? -45 : 0}
                  textAnchor={period === "month" ? "end" : "middle"}
                  height={period === "month" ? 60 : 30}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Profit"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {period === "month" ? "Monthly" : period === "day" ? "Daily" : period === "week" ? "Weekly" : "Yearly"} Orders
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  period === "month"
                    ? stats.monthlyStats
                    : stats.dailyStats.length > 0
                    ? stats.dailyStats
                    : [{ date: "No data", orders: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={period === "month" ? "month" : "date"}
                  tick={{ fontSize: 12 }}
                  angle={period === "month" ? -45 : 0}
                  textAnchor={period === "month" ? "end" : "middle"}
                  height={period === "month" ? 60 : 30}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelStyle={{ color: "#000" }} />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.ordersByStatus).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.ordersByStatus).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            {stats.topSellingItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.topSellingItems}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip labelStyle={{ color: "#000" }} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No items sold in this period
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Items Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topSellingItems.length > 0 ? (
                  stats.topSellingItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        ₹{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
                      No items sold in this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;

