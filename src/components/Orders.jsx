import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/allorders?page=${page}&status=${filter}`);
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      toast.error("Failed to load orders");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success("Status updated");
        fetchOrders(); // refresh
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Update failed");
    }
  };

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
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-emerald-700">All Orders</h2>

      {/* FILTER + PAGINATION */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm cursor-pointer"
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
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="text-sm text-green-700 font-bold">
            Page {page} of {pagination?.totalPages || 1}
          </span>
          <button
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">User</th>
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
                  <td className="px-4 py-2 font-mono text-sm">{o.razorpayOrderId}</td>
                  <td className="px-4 py-2">{o.user?.fullName || "Guest"}</td>
                  <td className="px-4 py-2">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className={`border rounded px-2 py-1 text-xs font-medium ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    ₹{(o.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      to={`/api/orders/admin/${o._id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:underline"
                    >
                      Download PDF
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
