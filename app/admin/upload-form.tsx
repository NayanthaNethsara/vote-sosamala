"use client";

import { useState } from "react";

export default function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/add-contestant", {
      method: "POST",
      body: form,
    });

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("Contestant added!");
      e.currentTarget.reset();
    } else {
      setMessage(result.error || "Failed to add contestant.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-4 rounded shadow"
    >
      <h2 className="text-lg font-semibold">Add Contestant</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        className="input"
      />
      <input
        type="text"
        name="bio"
        placeholder="Bio"
        required
        className="input"
      />
      <input
        type="text"
        name="category"
        placeholder="Category"
        required
        className="input"
      />
      <input
        type="file"
        name="image"
        accept="image/*"
        required
        className="input"
      />
      <button type="submit" disabled={loading} className="btn">
        {loading ? "Uploading..." : "Submit"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
