// src/components/PrescriptionUploadForm.jsx
import React, { useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function PrescriptionUploadForm({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const reader = new FileReader();
    reader.readAsDataURL(selected);
    reader.onloadend = () => setFile(reader.result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload a prescription");

    try {
      setLoading(true);
      await api.post("/prescriptions/uploads", { image: file });
      toast.success("Prescription uploaded successfully!");
      setFile(null);
      onClose(); // close modal on success
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">
          Upload Prescription
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mb-3 block w-full border border-gray-300 rounded p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
