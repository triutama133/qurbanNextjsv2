import { useState } from "react";

export default function FAQ({ q, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <span className="font-semibold text-gray-900">{q}</span>
        <span className="text-gray-500">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-2 text-sm text-gray-700">{children}</div>}
    </div>
  );
}
