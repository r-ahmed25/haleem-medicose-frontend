import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/orders?page=${page}&status=${filter}`);
        if (res.data?.success) {
          setOrders(res.data.orders || []);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    })();
  }, [page, filter]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-emerald-700">
        My Orders
      </h1>

      {/* ✅ FILTER + PAGINATION BAR */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">All</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {pagination?.totalPages || 1}
          </span>
          <button
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ✅ ORDERS TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm text-gray-700">
                    {o.razorpayOrderId}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      {o.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-800">
                    ₹{(o.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      to={`/api/orders/${o._id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Download PDF
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
