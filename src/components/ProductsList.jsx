import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash,
  Star,
  Package,
  Edit2,
  X,
  Save,
  Upload,
  Loader,
} from "lucide-react";
import formatCurrency from "../lib/formatCurrency";
import { useProductStore } from "../hooks/useProductStore";

const ProductsList = () => {
  const {
    deleteProduct,
    toggleFeaturedProduct,
    updateProduct,
    products,
    loading,
    categories,
    fetchCategories,
  } = useProductStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    minStockLevel: "5",
    expiryDate: "",
    batchNumber: "",
    manufacturer: "",
    composition: "",
    prescriptionRequired: false,
  });

  // Function to resolve product image (handles both array and single image)
  const resolveProductImage = (product) => {
    // 1. New products (Cloudinary)
    if (Array.isArray(product.images) && product.images.length > 0) {
      const primary = product.images.find((i) => i.isPrimary);
      const candidate = primary || product.images[0];

      if (candidate?.url) return candidate.url;
      if (candidate?.data) return candidate.data;
    }

    // 2. Old products
    if (product.image) return product.image;

    // 3. Absolute safe fallback
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setSelectedProduct(null);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      stock: product.stock?.toString() || "0",
      image: product.image || "",
      minStockLevel: product.minStockLevel?.toString() || "5",
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split("T")[0] : "",
      batchNumber: product.batchNumber || "",
      manufacturer: product.manufacturer || "",
      composition: product.composition || "",
      prescriptionRequired: product.prescriptionRequired || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
      minStockLevel: "5",
      expiryDate: "",
      batchNumber: "",
      manufacturer: "",
      composition: "",
      prescriptionRequired: false,
    });
  };

  const handleSaveEdit = async (productId) => {
    try {
      await updateProduct(productId, {
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        minStockLevel: parseInt(editForm.minStockLevel, 10) || 5,
        expiryDate: editForm.expiryDate || undefined,
        batchNumber: editForm.batchNumber,
        manufacturer: editForm.manufacturer,
        composition: editForm.composition,
        prescriptionRequired: editForm.prescriptionRequired,
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Mobile-specific image compression function
  const compressImageForMobile = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Mobile: More aggressive compression and smaller size limit
      if (isMobile) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB for mobile
          toast.error(
            "Image is too large for mobile. Please select an image smaller than 5MB."
          );
          return;
        }

        try {
          toast.loading("Compressing image for mobile...", {
            id: "image-compress",
          });
          const compressedImage = await compressImageForMobile(file, 600, 0.6);
          setEditForm({ ...editForm, image: compressedImage });
          toast.success("Image compressed for mobile", {
            id: "image-compress",
          });
        } catch (error) {
          console.error("Image compression failed:", error);
          toast.error("Failed to process image", { id: "image-compress" });
        }
      } else {
        // Desktop: Original logic
        if (file.size > 2 * 1024 * 1024) {
          toast.error(
            "Image is too large. Please select an image smaller than 2MB."
          );
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setEditForm({ ...editForm, image: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Mobile Details Modal
  const DetailsModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div
            className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 100%)",
            }}
          >
            <h2 className="text-lg font-bold text-white">Product Details</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Product Image */}
            {product.image && (
              <div className="flex justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-32 rounded-xl object-cover border border-gray-200"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-500">Name</span>
                <span className="text-sm font-medium text-slate-700 text-right max-w-[200px]">
                  {product.name}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Price</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#008080" }}
                >
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Category</span>
                <span className="text-sm text-slate-700">
                  {product.category}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Stock</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 10
                      ? "bg-emerald-100 text-emerald-700"
                      : product.stock > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} units`
                    : "Out of stock"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Featured</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    product.isFeatured
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.isFeatured ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  toggleFeaturedProduct(product._id);
                  onClose();
                }}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  product.isFeatured
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                    : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
              >
                <Star
                  className={`h-4 w-4 ${
                    product.isFeatured ? "fill-yellow-500" : ""
                  }`}
                />
                {product.isFeatured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => handleEditClick(product)}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-blue-100 text-blue-700 border border-blue-300"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  deleteProduct(product._id);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-red-100 text-red-700 border border-red-300"
              >
                <Trash className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Modal Component
  const EditModal = ({ product }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="sticky top-0 px-6 py-4 border-b flex justify-between items-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 100%)",
            }}
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Product
            </h2>
            <button
              onClick={handleCancelEdit}
              className="text-white/80 hover:text-white text-2xl font-bold p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-y"
                placeholder="Enter description"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm({ ...editForm, stock: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id || category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                value={editForm.minStockLevel}
                onChange={(e) =>
                  setEditForm({ ...editForm, minStockLevel: e.target.value })
                }
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="5"
              />
            </div>

            {/* Expiry Date & Batch Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={editForm.batchNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batchNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Batch #"
                />
              </div>
            </div>

            {/* Manufacturer & Composition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={editForm.manufacturer}
                  onChange={(e) =>
                    setEditForm({ ...editForm, manufacturer: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Manufacturer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Composition
                </label>
                <input
                  type="text"
                  value={editForm.composition}
                  onChange={(e) =>
                    setEditForm({ ...editForm, composition: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="e.g. Paracetamol 500mg"
                />
              </div>
            </div>

            {/* Prescription Required */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-prescriptionRequired"
                checked={editForm.prescriptionRequired}
                onChange={(e) =>
                  setEditForm({ ...editForm, prescriptionRequired: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="edit-prescriptionRequired" className="text-sm font-medium text-gray-700">
                Prescription Required
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
                {isMobile && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Mobile Optimized
                  </span>
                )}
              </label>
              <div className="flex items-center gap-4">
                {editForm.image && (
                  <img
                    src={editForm.image}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="edit-image"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="edit-image"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    <Upload className="h-4 w-4" />
                    {isMobile ? "Change Image (Auto-compress)" : "Change Image"}
                  </label>
                  {isMobile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Images are automatically compressed for faster mobile
                      upload
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingProduct)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #008080 0%, #003366 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="max-w-6xl mx-auto p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden"
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
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Products List
            </h2>
            <span className="ml-auto text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
              {products?.length || 0} items
            </span>
          </div>

          {/* Mobile View - Compact Cards */}
          {isMobile ? (
            <div className="space-y-3">
              {products?.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white/10 rounded-xl border border-white/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={resolveProductImage(product)}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover border border-white/20 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md flex-shrink-0 ml-3"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/50 italic text-sm bg-white/5 rounded-xl">
                  No products found.
                </div>
              )}
            </div>
          ) : (
            /* Desktop View - Full Table */
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full">
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0, 51, 102, 0.5) 0%, rgba(0, 100, 100, 0.5) 100%)",
                    }}
                  >
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Featured
                    </th>
                    <th
                      scope="col"
                      className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {products?.length > 0 ? (
                    products.map((product, idx) => (
                      <tr
                        key={product._id}
                        className={`transition-colors hover:bg-white/5 ${
                          idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover border border-white/20"
                                src={resolveProductImage(product)}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0">
                              <div className="text-sm font-medium text-white truncate max-w-[200px]">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(product.price.toFixed(1))}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.stock > 10
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : product.stock > 0
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {product.stock > 0 ? product.stock : "Out"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleFeaturedProduct(product._id)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              product.isFeatured
                                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                                : "bg-white/10 text-white/50 border border-white/20 hover:bg-white/20"
                            }`}
                            title={
                              product.isFeatured
                                ? "Remove from featured"
                                : "Add to featured"
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${
                                product.isFeatured ? "fill-yellow-400" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200"
                              title="Delete product"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-12 text-white/50 italic text-sm"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Details Modal */}
      {selectedProduct && (
        <DetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditModal product={products.find((p) => p._id === editingProduct)} />
      )}
    </>
  );
};

export default ProductsList;
