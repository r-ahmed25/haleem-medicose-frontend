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
  X,
} from "lucide-react";
import { useProductStore } from "../hooks/useProductStore";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: "0",
    minStockLevel: "5",
    expiryDate: "",
    batchNumber: "",
    manufacturer: "",
    composition: "",
    prescriptionRequired: false,
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
        images: [],
        stock: "0",
      });
    } catch {
      console.error("Error creating product");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (newProduct.images.length + files.length > MAX_IMAGES) {
      alert(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      if (file.size > MAX_IMAGE_SIZE) {
        alert("Each image must be less than 1MB");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setNewProduct((prev) => {
          const isFirst = prev.images.length === 0;
          return {
            ...prev,
            images: [
              ...prev.images,
              {
                data: reader.result,
                isPrimary: isFirst,
              },
            ],
          };
        });
      };

      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setNewProduct((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);

      if (updated.length && !updated.some((i) => i.isPrimary)) {
        updated[0].isPrimary = true;
      }

      return { ...prev, images: updated };
    });
  };

  const setPrimaryImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden mb-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <input
            className="w-full p-3 rounded-xl bg-white/10 text-white"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />

          {/* Description */}
          <textarea
            className="w-full p-3 rounded-xl bg-white/10 text-white"
            placeholder="Description"
            rows={3}
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            required
          />

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
              required
            />
          </div>

          {/* Min Stock Level */}
          <input
            type="number"
            className="w-full p-3 rounded-xl bg-white/10 text-white"
            placeholder="Min Stock Level (for low stock alerts)"
            value={newProduct.minStockLevel || 5}
            onChange={(e) =>
              setNewProduct({ ...newProduct, minStockLevel: e.target.value })
            }
          />

          {/* Expiry Date & Batch Number */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Expiry Date"
              value={newProduct.expiryDate || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, expiryDate: e.target.value })
              }
            />
            <input
              type="text"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Batch Number"
              value={newProduct.batchNumber || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, batchNumber: e.target.value })
              }
            />
          </div>

          {/* Manufacturer & Composition */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Manufacturer"
              value={newProduct.manufacturer || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, manufacturer: e.target.value })
              }
            />
            <input
              type="text"
              className="p-3 rounded-xl bg-white/10 text-white"
              placeholder="Composition (e.g., Paracetamol 500mg)"
              value={newProduct.composition || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, composition: e.target.value })
              }
            />
          </div>

          {/* Prescription Required */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prescriptionRequired"
              checked={newProduct.prescriptionRequired || false}
              onChange={(e) =>
                setNewProduct({ ...newProduct, prescriptionRequired: e.target.checked })
              }
              className="h-4 w-4 rounded"
            />
            <label htmlFor="prescriptionRequired" className="text-white text-sm">
              Prescription Required
            </label>
          </div>

          {/* Category */}
          <div className="relative">
            <select
              className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-sm appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              required
            >
              <option value="" className="bg-teal-800 text-white">
                Select Category
              </option>
              {categories.map((c) => (
                <option
                  key={c._id}
                  value={c.name}
                  className="bg-teal-800 text-white"
                >
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-white/70"
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

          {/* Image Upload */}
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white">
              <Upload size={18} /> Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {newProduct.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {newProduct.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.data}
                      alt=""
                      className={`h-20 w-20 object-cover rounded-lg border-2 ${
                        img.isPrimary
                          ? "border-emerald-400"
                          : "border-transparent"
                      }`}
                      onClick={() => setPrimaryImage(index)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hidden group-hover:block"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateProductForm;
