// ContactForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email.";
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
        message: form.message.trim(),
      };
      await api.post("/contact", payload);
      toast.success("Thanks — your message has been sent.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-start px-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
          style={{
            background: "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
            color: "#008080",
          }}
        >
          ← Home
        </Link>
      </div>
      <section className="py-8 px-2">
        {/* Enhanced center card with theme-matching gradient background */}
        <div
          className="max-w-5xl mx-auto p-10 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden"
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
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Contact Us
            </h3>
            <p className="text-white/90 text-base leading-relaxed max-w-lg mx-auto">
              Have a question or need help? Send us a message and we'll get back
              to you ASAP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="block">
                <span className="text-white/80 text-base font-medium mb-3 block">
                  Name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 px-5 py-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm text-base"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="block">
                <span className="text-white/80 text-base font-medium mb-3 block">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 px-5 py-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm text-base"
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-white/80 text-base font-medium mb-3 block">
                Subject (optional)
              </span>
              <input
                type="text"
                value={form.subject}
                onChange={update("subject")}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 px-5 py-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm text-base"
                placeholder="Short subject"
              />
            </label>

            <label className="block">
              <span className="text-white/80 text-base font-medium mb-3 block">
                Message
              </span>
              <textarea
                value={form.message}
                onChange={update("message")}
                rows="6"
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 px-5 py-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 resize-y backdrop-blur-sm text-base"
                placeholder="How can we help?"
                required
              />
            </label>

            <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-6 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 transform w-full md:w-auto max-w-[80%] md:max-w-none ${
                  loading
                    ? "opacity-70 cursor-wait text-white/70"
                    : "text-white shadow-lg hover:shadow-blue-500/25"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent`}
                style={{
                  background: loading
                    ? "linear-gradient(135deg, rgba(0, 51, 102, 0.7), rgba(0, 68, 102, 0.7))"
                    : "linear-gradient(135deg, var(--accent), #004466)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send message
                  </>
                )}
              </button>

              <span className="text-white/60 text-sm flex items-center gap-2 text-center md:text-left">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Response within{" "}
                <strong className="text-white/80 font-medium">
                  1 business day
                </strong>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
    </>
  );
}
