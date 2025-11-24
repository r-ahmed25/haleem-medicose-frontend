import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [page, filter]);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get(`/prescriptions/all?page=${page}&status=${filter}`);
      console.log(res)
      if (res?.data.success) {
        setPrescriptions(res.data.prescriptions || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      toast.error("Failed to load prescriptions");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/prescriptions/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success("Status updated");
        fetchPrescriptions(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Update failed");
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
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-emerald-700">All Prescriptions</h2>

      {/* FILTER + PAGINATION */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm cursor-pointer"
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

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Prescription ID</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm">{p._id}</td>
                  <td className="px-4 py-2">{p.user?.fullName || "N/A"}</td>
                  <td className="px-4 py-2">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p._id, e.target.value)}
                      className={`border rounded px-2 py-1 text-xs font-medium ${getStatusStyle(
                        p.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        window.open(p.fileUrl, "_blank", "noopener,noreferrer")
                      }
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No prescriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
