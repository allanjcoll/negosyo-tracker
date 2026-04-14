"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl px-5 py-2 text-sm font-medium text-white ${
        pending
          ? "cursor-not-allowed bg-gray-400"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {pending ? "Saving..." : "Save Income"}
    </button>
  );
}
