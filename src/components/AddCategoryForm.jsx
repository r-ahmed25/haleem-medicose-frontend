import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader, Tag } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useProductStore } from "../hooks/useProductStore";

const AddCategoryForm = () => {
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const fetchCategories = useProductStore((state) => state.fetchCategories);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/categories/add", {
        name: newCategory.name.trim(),
      });
      if (res.status >= 200 && res.status < 300) {
        toast.success(res.data.message || "Category added successfully");
        setNewCategory({ name: "" });
        fetchCategories();
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.response) {
        toast.error(
          error.response.data?.error ||
            error.response.data?.message ||
            "Server error occurred"
        );
      } else if (error.request) {
        toast.error("Network error - please check your connection");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden mb-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
        boxShadow:
          "0 25px 50px rgba(0, 128, 128, 0.25), 0 15px 35px rgba(0, 51, 102, 0.2)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(46, 204, 113, 0.15) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Add New Category
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">
            Create a new category for products
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Category Name
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-white/60" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter category name"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100 shadow-lg"
            style={{
              background: loading
                ? "linear-gradient(135deg, rgba(0, 51, 102, 0.7), rgba(0, 68, 102, 0.7))"
                : "linear-gradient(135deg, var(--accent), #004466)",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" aria-hidden="true" />
                Adding...
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                Add Category
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AddCategoryForm;
