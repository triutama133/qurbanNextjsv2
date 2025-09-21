"use client";
import { useState, useEffect } from "react";
import { FAQ } from "@/app/qurban/home/page.js";
import MDEditor from "@uiw/react-md-editor";

export default function FAQList() {
  const [qna, setQna] = useState([]);
  useEffect(() => {
    fetch('/api/qna')
      .then(res => res.json())
      .then(res => {
        console.log('FAQList fetch /api/qna:', res);
        setQna(Array.isArray(res.data) ? res.data : []);
      });
  }, []);
  if (!qna.length) return <div className="text-gray-500">Belum ada data QnA.</div>;
  return (
    <>
      {qna.map(item => (
        <FAQ key={item.id} q={<MDEditor.Markdown source={item.question || ""} />}> 
          <MDEditor.Markdown source={item.answer || ""} />
        </FAQ>
      ))}
    </>
  );
}

// Komponen FAQ harus diimport dari home/page.js
// atau bisa dipindahkan ke components jika ingin lebih modular
