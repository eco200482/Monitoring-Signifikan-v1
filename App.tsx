import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";
import "./App.css"; // pastikan App.css ada (atau hapus baris ini)

const COLORS = ["#FF8042", "#FFBB28", "#0088FE", "#00C49F"];

export default function App() {
  // sample data (masukkan id unik)
  const [detailData, setDetailData] = useState<any[]>([
    {
      id: Date.now() - 2000,
      pic: "Budi",
      unit: "Audit",
      segmen: "Kredit",
      periode: "Agustus 2025",
      permasalahan: "Kredit macet",
      rootcause: "Kurang monitoring",
      tindak: "Penagihan intensif",
      kerugian: 50000000,
      pengembalian: 20000000,
      status: "Belum Tindak Lanjut",
    },
    {
      id: Date.now() - 1000,
      pic: "Agus",
      unit: "Operasional",
      segmen: "Tabungan",
      periode: "Juli 2024",
      permasalahan: "Fraud teller",
      rootcause: "Internal control lemah",
      tindak: "SPV perbaikan SOP",
      kerugian: 30000000,
      pengembalian: 15000000,
      status: "Ditindaklanjuti",
    },
  ]);

  const [form, setForm] = useState<any>({
    pic: "",
    unit: "",
    segmen: "",
    periode: "",
    permasalahan: "",
    rootcause: "",
    tindak: "",
    kerugian: "",
    pengembalian: "",
    status: "Belum Tindak Lanjut",
  });
  const [password, setPassword] = useState("");

  // edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  // filter state
  const [filter, setFilter] = useState({
    tahun: "",
    status: "",
    pic: "",
    unit: "",
    segmen: "",
  });

  // sort
  const [sortKey, setSortKey] = useState<string>("pic");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const statusOptions = [
    "Belum Tindak Lanjut",
    "Proses",
    "Ditindaklanjuti",
    "Selesai",
  ];

  // ---------------- TABEL 1: REKAP PER TAHUN ----------------
  const kerugianPerTahun = detailData.reduce((acc: any, row) => {
    const tahun = row.periode?.match(/\d{4}/)?.[0] || "Lainnya";
    if (!acc[tahun]) acc[tahun] = { kerugian: 0, pengembalian: 0 };
    acc[tahun].kerugian += Number(row.kerugian) || 0;
    acc[tahun].pengembalian += Number(row.pengembalian) || 0;
    return acc;
  }, {} as Record<string, { kerugian: number; pengembalian: number }>);

  const table1Data = Object.keys(kerugianPerTahun)
    .sort()
    .map((tahun) => ({
      tahun,
      kerugian: kerugianPerTahun[tahun].kerugian,
      pengembalian: kerugianPerTahun[tahun].pengembalian,
      sisa:
        kerugianPerTahun[tahun].kerugian - kerugianPerTahun[tahun].pengembalian,
    }));

  // ---------------- TABEL 2: STATUS AGGREGATE (TOTAL) ----------------
  const statusCount = detailData.reduce(
    (acc: any, row: any) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  const table2Data = [
    {
      name: "Belum Tindak Lanjut",
      value: statusCount["Belum Tindak Lanjut"] || 0,
    },
    { name: "Proses", value: statusCount["Proses"] || 0 },
    { name: "Ditindaklanjuti", value: statusCount["Ditindaklanjuti"] || 0 },
    { name: "Selesai", value: statusCount["Selesai"] || 0 },
  ];

  // ---------------- ADD ----------------
  const handleAdd = () => {
    if (password !== "AIJatim123") {
      alert("Password salah!");
      return;
    }
    const newRow = {
      ...form,
      id: Date.now(),
      kerugian: Number(form.kerugian) || 0,
      pengembalian: Number(form.pengembalian) || 0,
    };
    setDetailData((prev) => [...prev, newRow]);
    // reset
    setForm({
      pic: "",
      unit: "",
      segmen: "",
      periode: "",
      permasalahan: "",
      rootcause: "",
      tindak: "",
      kerugian: "",
      pengembalian: "",
      status: "Belum Tindak Lanjut",
    });
    setPassword("");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (id: number) => {
    const pass = prompt("Masukkan password untuk edit:");
    if (pass !== "AIJatim123") {
      alert("Password salah!");
      return;
    }
    const row = detailData.find((r) => r.id === id);
    if (!row) return;
    setEditId(id);
    setEditForm({ ...row });
    // scroll to update form (optional)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = () => {
    if (editId === null || !editForm) return;
    // ensure numeric conversion
    editForm.kerugian = Number(editForm.kerugian) || 0;
    editForm.pengembalian = Number(editForm.pengembalian) || 0;
    setDetailData((prev) => prev.map((r) => (r.id === editId ? editForm : r)));
    setEditId(null);
    setEditForm(null);
  };

  // ---------------- EXPORT CSV ----------------
  const handleExport = () => {
    const csv = Papa.unparse(detailData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detail_temuan.csv";
    a.click();
  };

  // ---------------- FILTER + SORT for TABLE 3 ----------------
  const filteredData = detailData.filter((row) => {
    const tahun = row.periode?.match(/\d{4}/)?.[0] || "";
    return (
      (filter.tahun === "" || tahun === filter.tahun) &&
      (filter.status === "" || row.status === filter.status) &&
      (filter.pic === "" ||
        row.pic.toLowerCase().includes(filter.pic.toLowerCase())) &&
      (filter.unit === "" ||
        row.unit.toLowerCase().includes(filter.unit.toLowerCase())) &&
      (filter.segmen === "" ||
        row.segmen.toLowerCase().includes(filter.segmen.toLowerCase()))
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    // numeric fields
    if (sortKey === "kerugian" || sortKey === "pengembalian") {
      const na = Number(a[sortKey]) || 0;
      const nb = Number(b[sortKey]) || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    }
    // string compare (case-insensitive)
    const sa = (a[sortKey] || "").toString().toLowerCase();
    const sb = (b[sortKey] || "").toString().toLowerCase();
    if (sa < sb) return sortDir === "asc" ? -1 : 1;
    if (sa > sb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // helper format rupiah
  const fmt = (n: number) =>
    "Rp " +
    Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">
        📊 Monitoring Temuan Signifikan
      </h1>

      {/* TABEL 1 - REKAP PER TAHUN */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2 text-center">
          Tabel 1 - Rekap Kerugian per Tahun
        </h2>
        <table className="w-full border text-center">
          <thead className="bg-red-500 text-white">
            <tr>
              <th className="border p-2">Tahun</th>
              <th className="border p-2">Kerugian</th>
              <th className="border p-2">Pengembalian</th>
              <th className="border p-2">Sisa Kerugian</th>
            </tr>
          </thead>
          <tbody>
            {table1Data.length === 0 && (
              <tr>
                <td className="p-4" colSpan={4}>
                  Tidak ada data
                </td>
              </tr>
            )}
            {table1Data.map((r) => (
              <tr key={r.tahun}>
                <td className="border p-2 font-bold">{r.tahun}</td>
                <td className="border p-2 text-right">{fmt(r.kerugian)}</td>
                <td className="border p-2 text-right text-green-600">
                  {fmt(r.pengembalian)}
                </td>
                <td className="border p-2 text-right text-red-600">
                  {fmt(r.sisa)}
                </td>
              </tr>
            ))}
            {/* optional grand total */}
            {table1Data.length > 0 && (
              <tr className="font-bold bg-gray-50">
                <td className="border p-2">GRAND TOTAL</td>
                <td className="border p-2 text-right">
                  {fmt(
                    Object.values(kerugianPerTahun).reduce(
                      (s, v) => s + v.kerugian,
                      0
                    )
                  )}
                </td>
                <td className="border p-2 text-right text-green-600">
                  {fmt(
                    Object.values(kerugianPerTahun).reduce(
                      (s, v) => s + v.pengembalian,
                      0
                    )
                  )}
                </td>
                <td className="border p-2 text-right text-red-600">
                  {fmt(
                    Object.values(kerugianPerTahun).reduce(
                      (s, v) => s + v.kerugian - v.pengembalian,
                      0
                    )
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TABEL 2 - STATUS AGGREGATE */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2 text-center">
          Tabel 2 - Status Temuan (Total)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border text-center mb-3">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Total</th>
                {statusOptions.map((s) => (
                  <th key={s} className="border p-2">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{statusCount.total || 0}</td>
                {statusOptions.map((s) => (
                  <td key={s} className="border p-2">
                    {statusCount[s] || 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={table2Data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {table2Data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Filter Tabel 3</h2>
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Filter PIC"
            className="border p-2 rounded"
            value={filter.pic}
            onChange={(e) => setFilter({ ...filter, pic: e.target.value })}
          />
          <input
            placeholder="Filter Unit Kerja"
            className="border p-2 rounded"
            value={filter.unit}
            onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
          />
          <input
            placeholder="Filter Segmen"
            className="border p-2 rounded"
            value={filter.segmen}
            onChange={(e) => setFilter({ ...filter, segmen: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={filter.tahun}
            onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
          >
            <option value="">Semua Tahun</option>
            {table1Data.map((t) => (
              <option key={t.tahun} value={t.tahun}>
                {t.tahun}
              </option>
            ))}
          </select>
          <select
            className="border p-2 rounded"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div style={{ marginLeft: "auto" }} className="flex gap-2">
            <label className="flex items-center gap-2">
              Sort by:
              <select
                className="border p-1 rounded"
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value);
                  setSortDir("asc");
                }}
              >
                <option value="pic">PIC</option>
                <option value="unit">Unit</option>
                <option value="segmen">Segmen</option>
                <option value="periode">Periode</option>
                <option value="kerugian">Kerugian</option>
                <option value="pengembalian">Pengembalian</option>
                <option value="status">Status</option>
              </select>
            </label>
            <button
              className="border p-1 rounded"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            >
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>
      </div>

      {/* TABEL 3 */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Tabel 3 - Detail Temuan</h2>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">PIC</th>
                <th className="border p-2">Unit Kerja</th>
                <th className="border p-2">Segmen</th>
                <th className="border p-2">Periode</th>
                <th className="border p-2">Permasalahan</th>
                <th className="border p-2">Rootcause</th>
                <th className="border p-2">Tindak Lanjut Audit</th>
                <th className="border p-2">Kerugian</th>
                <th className="border p-2">Pengembalian</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 && (
                <tr>
                  <td className="p-4" colSpan={12}>
                    Tidak ada data
                  </td>
                </tr>
              )}
              {sortedData.map((row, idx) => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2">{idx + 1}</td>
                  <td className="border p-2">{row.pic}</td>
                  <td className="border p-2">{row.unit}</td>
                  <td className="border p-2">{row.segmen}</td>
                  <td className="border p-2">{row.periode}</td>
                  <td className="border p-2">{row.permasalahan}</td>
                  <td className="border p-2">{row.rootcause}</td>
                  <td className="border p-2">{row.tindak}</td>
                  <td className="border p-2 text-right">{fmt(row.kerugian)}</td>
                  <td className="border p-2 text-right text-green-600">
                    {fmt(row.pengembalian)}
                  </td>
                  <td className="border p-2">{row.status}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM INPUT */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3">Tambah Data Baru</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="PIC"
            value={form.pic}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, pic: e.target.value })}
          />
          <input
            placeholder="Unit Kerja"
            value={form.unit}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <input
            placeholder="Segmen"
            value={form.segmen}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, segmen: e.target.value })}
          />
          <input
            placeholder="Periode (e.g. Agustus 2025)"
            value={form.periode}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, periode: e.target.value })}
          />
          <textarea
            placeholder="Permasalahan"
            value={form.permasalahan}
            className="border p-2 rounded col-span-2"
            onChange={(e) => setForm({ ...form, permasalahan: e.target.value })}
          />
          <textarea
            placeholder="Rootcause"
            value={form.rootcause}
            className="border p-2 rounded col-span-2"
            onChange={(e) => setForm({ ...form, rootcause: e.target.value })}
          />
          <textarea
            placeholder="Tindak Lanjut Audit"
            value={form.tindak}
            className="border p-2 rounded col-span-2"
            onChange={(e) => setForm({ ...form, tindak: e.target.value })}
          />
          <input
            type="number"
            placeholder="Kerugian"
            value={form.kerugian}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, kerugian: e.target.value })}
          />
          <input
            type="number"
            placeholder="Pengembalian"
            value={form.pengembalian}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, pengembalian: e.target.value })}
          />
          <select
            value={form.status}
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="border p-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="col-span-2 bg-green-600 text-white py-2 rounded"
          >
            Tambah Data
          </button>
        </div>
      </div>

      {/* FORM UPDATE */}
      {editForm && (
        <div className="bg-yellow-50 border p-4 rounded-xl mb-6">
          <h2 className="font-semibold mb-3">Update Data</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="PIC"
              value={editForm.pic}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, pic: e.target.value })
              }
            />
            <input
              placeholder="Unit Kerja"
              value={editForm.unit}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, unit: e.target.value })
              }
            />
            <input
              placeholder="Segmen"
              value={editForm.segmen}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, segmen: e.target.value })
              }
            />
            <input
              placeholder="Periode"
              value={editForm.periode}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, periode: e.target.value })
              }
            />
            <textarea
              placeholder="Permasalahan"
              value={editForm.permasalahan}
              className="border p-2 rounded col-span-2"
              onChange={(e) =>
                setEditForm({ ...editForm, permasalahan: e.target.value })
              }
            />
            <textarea
              placeholder="Rootcause"
              value={editForm.rootcause}
              className="border p-2 rounded col-span-2"
              onChange={(e) =>
                setEditForm({ ...editForm, rootcause: e.target.value })
              }
            />
            <textarea
              placeholder="Tindak Lanjut Audit"
              value={editForm.tindak}
              className="border p-2 rounded col-span-2"
              onChange={(e) =>
                setEditForm({ ...editForm, tindak: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Kerugian"
              value={editForm.kerugian}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, kerugian: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Pengembalian"
              value={editForm.pengembalian}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  pengembalian: Number(e.target.value),
                })
              }
            />
            <select
              value={editForm.status}
              className="border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="col-span-2 flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-yellow-600 text-white py-2 px-4 rounded"
              >
                Update Data
              </button>
              <button
                onClick={() => {
                  setEditId(null);
                  setEditForm(null);
                }}
                className="bg-gray-300 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
