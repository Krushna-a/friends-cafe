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
      <div className="h-screen bg-soft-cream p-4 mt-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-coffee-brown/30 border-t-coffee-brown mx-auto mb-4"></div>
          <div className="text-muted-brown font-medium">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-screen bg-soft-cream p-4 mt-2 flex items-center justify-center">
        <div className="bg-clean-white rounded-2xl shadow-lg border border-beige p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark-cocoa mb-2">No statistics available</h3>
            <p className="text-muted-brown">Statistics will appear once you have order data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-soft-cream p-4 mt-2 w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-cocoa">Analytics Dashboard</h2>
            <p className="text-sm text-muted-brown mt-1">Track your café's performance and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-coffee-brown/20 rounded-xl px-4 py-2 bg-clean-white text-dark-espresso focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={fetchStats}
              className="bg-caramel-orange text-white py-2 px-6 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-muted-brown">Total Revenue</div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.summary.totalRevenue.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-muted-brown">Profit</div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ₹{stats.summary.profit.toFixed(2)}
            </div>
            <div className="text-xs text-muted-brown mt-1">
              (30% margin)
            </div>
          </div>
          
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-muted-brown">Total Orders</div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.summary.totalOrders}
            </div>
            <div className="text-xs text-muted-brown mt-1">
              {stats.summary.paidOrders} paid, {stats.summary.pendingOrders} pending
            </div>
          </div>
          
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-muted-brown">Total Customers</div>
              <div className="w-10 h-10 bg-coffee-brown/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-coffee-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-coffee-brown">
              {stats.summary.totalCustomers}
            </div>
            <div className="text-xs text-muted-brown mt-1">
              {stats.summary.newCustomers} new this {period}
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <h3 className="text-lg font-bold text-dark-cocoa mb-4">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey={period === "month" ? "month" : "date"}
                  tick={{ fontSize: 12, fill: "#6B4F3F" }}
                  angle={period === "month" ? -45 : 0}
                  textAnchor={period === "month" ? "end" : "middle"}
                  height={period === "month" ? 60 : 30}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B4F3F" }} />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  labelStyle={{ color: "#2B1B12" }}
                  contentStyle={{ backgroundColor: "#FAF6F2", border: "1px solid #F1E6D8", borderRadius: "12px" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7A3E1D"
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ r: 5, fill: "#7A3E1D" }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#C66A2B"
                  strokeWidth={3}
                  name="Profit"
                  dot={{ r: 5, fill: "#C66A2B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <h3 className="text-lg font-bold text-dark-cocoa mb-4">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey={period === "month" ? "month" : "date"}
                  tick={{ fontSize: 12, fill: "#6B4F3F" }}
                  angle={period === "month" ? -45 : 0}
                  textAnchor={period === "month" ? "end" : "middle"}
                  height={period === "month" ? 60 : 30}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B4F3F" }} />
                <Tooltip 
                  labelStyle={{ color: "#2B1B12" }}
                  contentStyle={{ backgroundColor: "#FAF6F2", border: "1px solid #F1E6D8", borderRadius: "12px" }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#7A3E1D" name="Orders" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders by Status */}
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <h3 className="text-lg font-bold text-dark-cocoa mb-4">Orders by Status</h3>
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
                  fill="#7A3E1D"
                  dataKey="value"
                >
                  {Object.entries(stats.ordersByStatus).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#7A3E1D", "#C66A2B", "#4B2A1A", "#6B4F3F", "#2B1B12"][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FAF6F2", border: "1px solid #F1E6D8", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
            <h3 className="text-lg font-bold text-dark-cocoa mb-4">Top Selling Items</h3>
            {stats.topSellingItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.topSellingItems}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#6B4F3F" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fill: "#6B4F3F" }}
                    width={90}
                  />
                  <Tooltip 
                    labelStyle={{ color: "#2B1B12" }}
                    contentStyle={{ backgroundColor: "#FAF6F2", border: "1px solid #F1E6D8", borderRadius: "12px" }}
                  />
                  <Legend />
                  <Bar dataKey="quantity" fill="#C66A2B" name="Quantity Sold" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-muted-brown font-medium">No items sold in this period</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Items Table */}
        <div className="bg-clean-white rounded-2xl shadow-lg p-6 border border-beige">
          <h3 className="text-lg font-bold text-dark-cocoa mb-4">Top Selling Items Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-dark-cocoa">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-dark-cocoa">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-dark-cocoa">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {stats.topSellingItems.length > 0 ? (
                  stats.topSellingItems.map((item, index) => (
                    <tr key={index} className="hover:bg-soft-cream/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-dark-espresso">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-brown">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm font-bold text-coffee-brown">
                        ₹{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center">
                      <div className="text-muted-brown">No items sold in this period</div>
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

