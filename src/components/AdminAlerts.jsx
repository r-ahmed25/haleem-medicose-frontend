import { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { AlertTriangle, Package, Clock } from "lucide-react";

const AdminAlerts = () => {
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [lowStockRes, expiringRes] = await Promise.all([
        api.get("/alerts/low-stock"),
        api.get("/alerts/expiring?days=30"),
      ]);
      setLowStock(lowStockRes.data.products || []);
      setExpiring(expiringRes.data.products || []);
    } catch (error) {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);

    const handleRefresh = () => {
      fetchAlerts();
    };

    window.addEventListener("refresh-admin-alerts", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-admin-alerts", handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading alerts...</div>
    );
  }

  if (lowStock.length === 0 && expiring.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {lowStock.length > 0 && (
        <div
          className="rounded-xl p-4 border-l-4 border-red-500"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-red-700">Low Stock Alert</h3>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
              {lowStock.length}
            </span>
          </div>
          <div className="space-y-2">
            {lowStock.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between bg-white/80 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <span className="text-sm text-red-600 font-semibold">
                  Stock: {product.stock} / Min: {product.minStockLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div
          className="rounded-xl p-4 border-l-4 border-amber-500"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-amber-700">Expiring Soon</h3>
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
              {expiring.length}
            </span>
          </div>
          <div className="space-y-2">
            {expiring.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between bg-white/80 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <span className="text-sm text-amber-600 font-semibold">
                  Expires: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
