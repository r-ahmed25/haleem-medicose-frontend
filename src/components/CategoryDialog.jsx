import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader, Tag, Edit2, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../hooks/useProductStore";

const CategoryDialog = ({ isOpen, onClose }) => {
  const categories = useProductStore((state) => state.categories);
  const addCategory = useProductStore((state) => state.addCategory);
  const updateCategory = useProductStore((state) => state.updateCategory);
  const deleteCategory = useProductStore((state) => state.deleteCategory);
  const fetchCategories = useProductStore((state) => state.fetchCategories);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setName("");
      setEditingId(null);
      setEditName("");
      setDeleteConfirmId(null);
    }
  }, [isOpen, fetchCategories]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      await addCategory(name.trim());
      setName("");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const handleEditSave = async (id) => {
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      setEditName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setLoading(true);
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <form onSubmit={handleAdd} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="New category name"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">Add</span>
                </button>
              </form>

              <div className="space-y-2">
                {categories.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">
                    No categories yet. Create one above.
                  </p>
                )}
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    {editingId === cat._id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(cat._id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditName("");
                            }
                          }}
                        />
                        <button
                          onClick={() => handleEditSave(cat._id)}
                          disabled={loading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                          disabled={loading}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <Tag className="h-4 w-4 text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditStart(cat)}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            disabled={loading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              deleteConfirmId === cat._id
                                ? "text-red-700 bg-red-100 hover:bg-red-200"
                                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {deleteConfirmId === cat._id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDialog;
