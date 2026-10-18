"use client";

import { useState, useRef } from "react";

export default function BulkImportView({ merchants, loading, onRefresh }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  function parseCSV(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return { parsed: [], errs: ["File rỗng hoặc thiếu header"] };
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["company_name", "tax_id", "contact_name", "contact_email", "contact_phone"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length) return { parsed: [], errs: [`Thiếu cột: ${missing.join(", ")}`] };

    const parsed = [];
    const errs = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
      if (!obj.company_name) { errs.push(`Dòng ${i + 1}: thiếu company_name`); continue; }
      if (!obj.contact_email && !obj.contact_phone) { errs.push(`Dòng ${i + 1}: thiếu email hoặc SĐT`); continue; }
      parsed.push(obj);
    }
    return { parsed, errs };
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { parsed, errs } = parseCSV(ev.target.result);
      setRows(parsed);
      setErrors(errs);
    };
    reader.readAsText(file);
  }

  async function importAll() {
    if (rows.length === 0) return;
    setBusy(true);
    let success = 0, failed = 0;
    const importErrors = [];

    for (const row of rows) {
      try {
        const res = await fetch("/api/merchant-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            company_name: row.company_name,
            tax_id: row.tax_id || "",
            contact_name: row.contact_name || "",
            contact_email: row.contact_email || "",
            contact_phone: row.contact_phone || "",
            sales_owner: row.sales_owner || "",
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        success++;
      } catch (err) {
        failed++;
        importErrors.push(`${row.company_name}: ${err.message}`);
      }
    }

    setResult({ success, failed, errors: importErrors });
    setRows([]);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = "";
    onRefresh();
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Import hàng loạt merchant từ file CSV
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
          Upload file CSV
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.6 }}>
          Cột bắt buộc: <code style={codeStyle}>company_name</code>, <code style={codeStyle}>tax_id</code>,{" "}
          <code style={codeStyle}>contact_name</code>, <code style={codeStyle}>contact_email</code>,{" "}
          <code style={codeStyle}>contact_phone</code><br />
          Cột tuỳ chọn: <code style={codeStyle}>sales_owner</code>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          style={{ fontSize: 12, marginBottom: 12 }}
        />

        {errors.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>Lỗi validation</div>
            {errors.map((e, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "#ef4444" }}>{e}</div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 8, fontWeight: 600 }}>
              {rows.length} merchant sẵn sàng import
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr>
                    {["#", "Tên DN", "MST", "Liên hệ", "Email", "SĐT", "Sales"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{r.company_name}</td>
                      <td style={tdStyle}>{r.tax_id || "—"}</td>
                      <td style={tdStyle}>{r.contact_name || "—"}</td>
                      <td style={tdStyle}>{r.contact_email || "—"}</td>
                      <td style={tdStyle}>{r.contact_phone || "—"}</td>
                      <td style={tdStyle}>{r.sales_owner || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={importAll}
              disabled={busy}
              style={{
                padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
                border: "none", cursor: "pointer", opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Đang import..." : `Import ${rows.length} merchant`}
            </button>
          </>
        )}

        {result && (
          <div style={{
            marginTop: 14, padding: "12px 16px", borderRadius: 10,
            background: result.failed === 0 ? "rgba(34,197,94,0.08)" : "rgba(251,191,36,0.08)",
            border: `1px solid ${result.failed === 0 ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.2)"}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              Kết quả import
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Thành công: <span style={{ color: "#22c55e", fontWeight: 600 }}>{result.success}</span>
              {result.failed > 0 && (
                <> · Thất bại: <span style={{ color: "#ef4444", fontWeight: 600 }}>{result.failed}</span></>
              )}
            </div>
            {result.errors.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: "#ef4444" }}>
                {result.errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template download */}
      <div style={{ ...cardStyle, marginTop: 16, padding: "14px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
          Template CSV mẫu
        </div>
        <button
          onClick={() => {
            const csv = "company_name,tax_id,contact_name,contact_email,contact_phone,sales_owner\nCong ty ABC,0101234567,Nguyen Van A,a@abc.com,0901234567,Sales01\nCong ty XYZ,0109876543,Tran Thi B,b@xyz.com,0987654321,Sales02";
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "merchant_import_template.csv"; a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "var(--surface-soft)", color: "var(--text-dim)",
            border: "1px solid var(--border)", cursor: "pointer",
          }}
        >
          Tải template CSV
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "18px 20px",
};
const codeStyle = {
  background: "var(--surface-soft)", padding: "1px 6px", borderRadius: 4,
  fontSize: 11, fontFamily: "monospace",
};
const thStyle = {
  textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)",
  color: "var(--text-faint)", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 0.4,
};
const tdStyle = {
  padding: "6px 8px", borderBottom: "1px solid var(--border-soft)",
  color: "var(--text-dim)",
};
