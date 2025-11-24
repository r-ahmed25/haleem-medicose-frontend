// src/pages/MyPrescriptions.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState("");

  // Fetch prescriptions
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/prescriptions?page=${page}&status=${filter}`);
        if (res.data?.success) {
          setPrescriptions(res.data.prescriptions || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        toast.error("Failed to load prescriptions");
      }
    })();
  }, [page, filter]);

  // Handle viewing a specific prescription
const handleView = async (id) => {
  try {
    const res = await api.get(`/prescriptions/${id}`);
    if (res.data?.fileUrl) {
      window.open(res.data.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("No file found for this prescription");
    }
  } catch (err) {
    console.error("Error fetching prescription:", err);
    toast.error("Unable to view prescription");
  }
};


  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-emerald-700">
        My Prescriptions
      </h1>

      {/* ✅ FILTER + PAGINATION BAR */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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

      {/* ✅ TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Prescription ID</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm text-gray-700">
                    {p._id}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                        p.status
                      )}`}
                    >
                      {p.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center ">
                    <button
                      onClick={() => handleView(p._id)}
                      className="text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                  No prescriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
