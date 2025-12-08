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
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <main
      className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f8fffe 0%, #f0f9f7 100%)",
      }}
    >
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{
          background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        My Orders
      </h1>

      {/* Filter + Pagination Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
          }}
        >
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
              color: "#008080",
            }}
          >
            ← Prev
          </button>
          <span
            className="text-sm font-medium px-3 py-2 rounded-lg bg-white shadow-sm"
            style={{ color: "#003366" }}
          >
            {page} / {pagination?.totalPages || 1}
          </span>
          <button
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
              color: "#008080",
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="overflow-x-auto rounded-2xl shadow-lg border border-teal-100"
        style={{ background: "white" }}
      >
        <table className="min-w-full">
          <thead
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
            }}
          >
            <tr>
              <th
                className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#003366" }}
              >
                Order ID
              </th>
              <th
                className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#003366" }}
              >
                Date
              </th>
              <th
                className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#003366" }}
              >
                Status
              </th>
              <th
                className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#003366" }}
              >
                Total
              </th>
              <th
                className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#003366" }}
              >
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {orders.length > 0 ? (
              orders.map((o, idx) => (
                <tr
                  key={o._id}
                  className={`transition-colors hover:bg-teal-50/50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td
                    className="px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm"
                    style={{ color: "#334155" }}
                  >
                    <span className="truncate block max-w-[100px] sm:max-w-none">
                      {o.razorpayOrderId}
                    </span>
                  </td>
                  <td
                    className="px-4 sm:px-6 py-4 text-sm"
                    style={{ color: "#475569" }}
                  >
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      {o.status || "N/A"}
                    </span>
                  </td>
                  <td
                    className="px-4 sm:px-6 py-4 text-right font-bold text-base"
                    style={{ color: "#008080" }}
                  >
                    ₹{(o.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <a
                      href={`${
                        import.meta.env.PROD
                          ? "https://haleem-medicose-backend.onrender.com/api"
                          : import.meta.env.VITE_API_URL ||
                            "http://localhost:5000/api"
                      }/orders/${o._id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, #008080 0%, #003366 100%)",
                        color: "white",
                      }}
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-12 text-slate-400 italic text-sm"
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
