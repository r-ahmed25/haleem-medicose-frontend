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
        const res = await api.get("/auth/getProfile", { withCredentials: true });
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
      const res = await api.put("/auth/update-profile", data, { withCredentials: true });
      toast.success(res.data.message || "Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mute-200 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/40">
        <h2 className="text-2xl font-semibold text-teal-800 text-center mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block mb-1 text-teal-700 font-medium">
              Full Name
            </label>
            <input
              {...register("fullName")}
              className="w-full border border-teal-200 focus:border-teal-500 focus:ring focus:ring-teal-100 p-2.5 rounded-md outline-none transition"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block mb-1 text-teal-700 font-medium">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full border border-teal-200 focus:border-teal-500 focus:ring focus:ring-teal-100 p-2.5 rounded-md outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-1 text-teal-700 font-medium">
              Phone
            </label>
            <input
              {...register("phone")}
              className="w-full border border-teal-200 focus:border-teal-500 focus:ring focus:ring-teal-100 p-2.5 rounded-md outline-none transition"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block mb-1 text-teal-700 font-medium">
              Alternate Phone
            </label>
            <input
              {...register("altPhone")}
              className="w-full border border-teal-200 focus:border-teal-500 focus:ring focus:ring-teal-100 p-2.5 rounded-md outline-none transition"
              placeholder="Alternate phone"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-2.5 rounded-md hover:from-teal-700 hover:to-teal-600 transition font-medium shadow-md disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
