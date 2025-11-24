// ContactForm.jsx
import React, { useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.message.trim() || form.message.trim().length < 10)
      return "Please enter a message (at least 10 characters).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim()
      };
      await api.post("/contact", payload);
      toast.success("Thanks — your message has been sent.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to send. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // gradient sampled from your image
  const gradientStyle = {
    background: "transparent"
  };

  return (
    <section style={gradientStyle} className="py-12">
      {/* center card with a dark translucent surface so it blends with your theme */}
      <div className="max-w-2xl mx-auto p-6 rounded-lg bg-mute-700 border border-green-700 shadow-lg">
        <h3 className="text-2xl font-semibold text-green-700 mb-2">Contact Us</h3>
        <p className="text-sm text-gray-700 mb-6">
          Have a question or need help? Send us a message and we’ll get back to you ASAP.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-700">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                className="mt-1 block w-full rounded-md bg-mute-700 border border-green-700 shadow-lg text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-emerald-400"
                placeholder="Your name"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                className="mt-1 block w-full rounded-md bg-mute-700 border border-green-700 shadow-lg text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-emerald-400"
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-gray-700">Subject (optional)</span>
            <input
              type="text"
              value={form.subject}
              onChange={update("subject")}
              className="mt-1 block w-full rounded-md bg-mute-700 border border-green-700 shadow-lg text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-emerald-400"
              placeholder="Short subject"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-700">Message</span>
            <textarea
              value={form.message}
              onChange={update("message")}
              rows="5"
              className="mt-1 block w-full rounded-md bg-mute-700 border border-green-700 shadow-lg text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 resize-y"
              placeholder="How can we help?"
              required
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                loading ? "bg-emerald-600/70 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700"
              } text-white`}
            >
              {loading ? "Sending..." : "Send message"}
            </button>

            <span className="text-xs text-gray-400">
              Response within <strong className="text-gray-500">1 business day</strong>
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
