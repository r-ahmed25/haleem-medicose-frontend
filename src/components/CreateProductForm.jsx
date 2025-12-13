import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Upload,
  Loader,
  Package,
  FileText,
  DollarSign,
  Tag,
  Layers,
} from "lucide-react";
import { useProductStore } from "../hooks/useProductStore";

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "0",
  });

  const { createProduct, loading, categories, fetchCategories } =
    useProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "0",
      });
    } catch {
      console.log("error creating a product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };

      reader.readAsDataURL(file); // base64
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden mb-8"
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
            Create New Product
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">
            Add a new product to your inventory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Product Name
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-white/60" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter product name"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Description
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                <FileText
                  className="h-5 w-5 text-white/60"
                  aria-hidden="true"
                />
              </div>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows="3"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm resize-y"
                placeholder="Enter product description"
                required
              />
            </div>
          </div>

          {/* Price and Stock - Side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Price (₹)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign
                    className="h-5 w-5 text-white/60"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Stock Quantity
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Layers
                    className="h-5 w-5 text-white/60"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  min="0"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Category
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-white/60" aria-hidden="true" />
              </div>
              <select
                id="category"
                name="category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                required
              >
                <option value="" className="bg-slate-800 text-white">
                  Select a category
                </option>
                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category.name}
                    className="bg-slate-800 text-white"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="image"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="image"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 backdrop-blur-sm"
              >
                <Upload className="h-5 w-5" />
                Upload Image
              </label>
              {newProduct.image && (
                <span className="text-sm text-emerald-400 flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Image uploaded
                </span>
              )}
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
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                Create Product
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateProductForm;
