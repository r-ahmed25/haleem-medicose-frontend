import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function ProfileForm() {
  const { register, handleSubmit, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/getProfile", {
          withCredentials: true,
        });
        const user = res.data;
        setValue("fullName", user.fullName);
        setValue("email", user.email);
        setValue("phone", user.phone || "");
        setValue("altPhone", user.altPhone || "");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", data, {
        withCredentials: true,
      });
      toast.success(res.data.message || "Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      {/* Enhanced center card with theme-matching gradient background */}
      <div
        className="max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
          boxShadow:
            "0 25px 50px rgba(0, 128, 128, 0.25), 0 15px 35px rgba(0, 51, 102, 0.2)",
        }}
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
            Update Profile
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Full Name
              </label>
              <input
                {...register("fullName")}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Phone
              </label>
              <input
                {...register("phone")}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Alternate Phone
              </label>
              <input
                {...register("altPhone")}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="Alternate phone"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100"
              style={{
                background: loading
                  ? "linear-gradient(135deg, rgba(0, 51, 102, 0.7), rgba(0, 68, 102, 0.7))"
                  : "linear-gradient(135deg, var(--accent), #004466)",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
