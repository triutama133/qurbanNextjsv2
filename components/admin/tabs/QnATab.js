import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

export default function QnATab() {
  const [qna, setQna] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "", order: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/qna")
      .then((res) => res.json())
      .then((res) => setQna(res.data || []));
  }, [loading]);

  function handleEdit(item) {
    setEditing(item.id);
    setForm({ question: item.question, answer: item.answer, order: item.order ?? 0 });
  }

  function handleDelete(id) {
    setLoading(true);
    fetch("/api/qna", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(() => setLoading(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    fetch("/api/qna", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editing }),
    }).then(() => {
      setLoading(false);
      setEditing(null);
      setForm({ question: "", answer: "", order: 0 });
    });
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Kelola QnA / FAQ</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div>
          <label className="block font-semibold">Urutan (angka, kecil = atas):</label>
          <input
            type="number"
            min={0}
            value={form.order}
            onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))}
            className="border rounded px-2 py-1 w-24 mb-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Pertanyaan (Markdown, support bold/italic/underline):</label>
          <MDEditor
            value={form.question}
            onChange={val => setForm(f => ({ ...f, question: val || "" }))}
            height={120}
          />
        </div>
        <div className="mt-2">
          <label className="block font-semibold">Jawaban (Markdown, support bold/italic/underline):</label>
          <MDEditor
            value={form.answer}
            onChange={val => setForm(f => ({ ...f, answer: val || "" }))}
            height={160}
          />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white font-semibold">
          {editing ? "Update QnA" : "Tambah QnA"}
        </button>
        {editing && (
          <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-300" onClick={() => { setEditing(null); setForm({ question: "", answer: "", order: 0 }); }}>
            Batal Edit
          </button>
        )}
      </form>
      <div>
        <h3 className="font-bold mb-2">Daftar QnA</h3>
        <ul className="space-y-4">
          {qna.map(item => (
            <li key={item.id} className="border rounded p-3">
              <div className="font-semibold"><MDEditor.Markdown source={item.question || ""} /></div>
              <div className="mt-1 text-gray-700"><MDEditor.Markdown source={item.answer || ""} /></div>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 rounded bg-emerald-500 text-white text-sm" onClick={() => handleEdit(item)}>Edit</button>
                <button className="px-3 py-1 rounded bg-red-500 text-white text-sm" onClick={() => handleDelete(item.id)}>Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
