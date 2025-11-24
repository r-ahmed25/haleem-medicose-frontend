import { BarChart, PlusCircle, ShoppingBasket, ClipboardList } from "lucide-react";
import { LiaPrescriptionSolid } from "react-icons/lia";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import Orders from "../components/Orders"; // ✅ NEW COMPONENT
import { useProductStore } from "../hooks/useProductStore";
import AdminPrescriptions from "./AdminPrescriptions";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "orders", label: "Orders", icon: ClipboardList }, // ✅ NEW TAB
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "customerprescriptions", label: "CustomerPrescriptions", icon: LiaPrescriptionSolid }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Layout: md+ two columns (sidebar + content). On mobile the sidebar is hidden and tabs move to top */}
      <div className="md:flex md:items-stretch">
        {/* LEFT SIDEBAR: visible on md+ as a full-height vertical tabs column */}
        <aside
          className="hidden md:flex flex-col items-center gap-4 p-4 border-r bg-gray-50 h-screen sticky top-0 shadow-sm w-[12%]"
          aria-label="Admin sidebar"
        >
          <motion.h2
            className="text-xl font-bold text-green-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Admin
          </motion.h2>

          <nav className="flex flex-col items-stretch w-full mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 justify-start text-sm font-medium ml-2 mr-2 ${
                    active
                      ? "bg-green-700 text-white shadow-lg transform scale-100"
                      : "text-gray-800 hover:bg-green-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Optional quick-actions or meta area at bottom */}
          <div className="mt-auto text-xs text-gray-500 px-2">v1.0 • admin</div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* TOP BAR for mobile: horizontal scrollable tabs */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-green-700">Admin Dashboard</h1>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                        active
                          ? "bg-green-700 text-white"
                          : "bg-gray-200 text-gray-900 hover:bg-green-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate max-w-[120px]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop heading shown in right area (keeps layout balanced) */}
            <div className="hidden md:block mb-6">
              <motion.h1
                className="text-3xl font-bold text-green-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Admin Dashboard
              </motion.h1>
            </div>

            {/* CONTENT CARD: make fully responsive and allow internal scrolling on overflow */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 min-h-[40vh] max-w-full overflow-visible">
              {/* Wrap tab content with responsive helpers so child components don't overflow on small screens */}
              <div className="w-full max-w-full overflow-auto">
                <div className="w-full max-w-full">
                  {activeTab === "create" && (
                    <div className="w-full max-w-full">
                      <CreateProductForm />
                    </div>
                  )}

                  {activeTab === "products" && (
                    <div className="w-full max-w-full">
                      <ProductsList />
                    </div>
                  )}

                  {activeTab === "orders" && (
                    <div className="w-full max-w-full">
                      <Orders />
                    </div>
                  )}

                  {activeTab === "analytics" && (
                    <div className="w-full max-w-full">
                      <AnalyticsTab />
                    </div>
                  )}

                  {activeTab === "customerprescriptions" && (
                    <div className="w-full max-w-full">
                      <AdminPrescriptions />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Small-screen hint to collapse/expand sidebar on larger devices (optional) */}
            <div className="mt-4 text-xs text-gray-500 hidden md:block">Tip: use sidebar to quickly switch tabs.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
