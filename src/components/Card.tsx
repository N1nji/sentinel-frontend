// src/components/Card.tsx
import React from "react";

export default function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      {title && <h3 className="font-semibold text-lg mb-3">{title}</h3>}
      {children}
    </div>
  );
}
