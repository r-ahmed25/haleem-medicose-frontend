// src/components/PrescriptionUploadForm.jsx
import React, { useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { set } from "react-hook-form";

export default function PrescriptionUploadForm({ onClose, setStatus }) {
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
      setStatus("success"); // Update status on successful upload
      setFile(null);
      onClose(); // close modal on success
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setStatus("error"); // Update status on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(0, 51, 102, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-6 relative mx-4"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
          border: "1px solid rgba(0, 128, 128, 0.15)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full text-xl transition-all hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
            color: "#003366",
          }}
        >
          &times;
        </button>
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Upload Prescription
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            className="mb-4 p-4 rounded-xl border-2 border-dashed transition-all hover:border-teal-400"
            style={{
              borderColor: "rgba(0, 128, 128, 0.3)",
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
            }}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:cursor-pointer transition-all"
              style={{
                color: "#475569",
              }}
            />
            <p
              className="text-xs mt-2 text-center"
              style={{ color: "#64748b" }}
            >
              Supported: Images & PDF files
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
            }}
          >
            {loading ? "Uploading..." : "Upload Prescription"}
          </button>
        </form>
      </div>
    </div>
  );
}
