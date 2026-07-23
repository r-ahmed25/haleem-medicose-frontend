import { CheckCircle, Clock, Package, Truck, Home, XCircle } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-gray-500", bg: "bg-gray-100" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-100" },
  processing: { label: "Processing", icon: Package, color: "text-yellow-500", bg: "bg-yellow-100" },
  packed: { label: "Packed", icon: Package, color: "text-purple-500", bg: "bg-purple-100" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-500", bg: "bg-indigo-100" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-orange-500", bg: "bg-orange-100" },
  delivered: { label: "Delivered", icon: Home, color: "text-green-500", bg: "bg-green-100" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
  returned: { label: "Returned", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

const OrderTracking = ({ order, onStatusUpdate }) => {
  const currentStatus = order?.status || "pending";
  const statuses = Object.keys(statusConfig);
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        {statuses.map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive ? config.bg : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? config.color : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium text-center ${
                  isCurrent ? "font-bold" : ""
                } ${isActive ? config.color : "text-gray-400"}`}
              >
                {config.label}
              </span>
              {index < statuses.length - 1 && (
                <div
                  className={`hidden sm:block absolute h-0.5 w-full top-5 left-1/2 ${
                    index < currentIndex ? config.color.replace("text", "bg") : "bg-gray-200"
                  }`}
                  style={{ zIndex: -1 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {onStatusUpdate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Update Order Status</h4>
          <div className="flex gap-2 flex-wrap">
            {statuses.slice(0, -1).map((status) => (
              <button
                key={status}
                onClick={() => onStatusUpdate(status)}
                disabled={status === currentStatus}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  status === currentStatus
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:border-teal-500 hover:text-teal-600"
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
