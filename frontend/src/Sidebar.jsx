import { useState } from "react";

const CATEGORIES = [
  {
    name: "Western Digits",
    chars: [
      { label: "0", name: "Zero",  desc: "Arabic numeral zero." },
      { label: "1", name: "One",   desc: "Arabic numeral one." },
      { label: "2", name: "Two",   desc: "Arabic numeral two." },
      { label: "3", name: "Three", desc: "Arabic numeral three." },
      { label: "4", name: "Four",  desc: "Arabic numeral four." },
      { label: "5", name: "Five",  desc: "Arabic numeral five." },
      { label: "6", name: "Six",   desc: "Arabic numeral six." },
      { label: "7", name: "Seven", desc: "Arabic numeral seven." },
      { label: "8", name: "Eight", desc: "Arabic numeral eight." },
      { label: "9", name: "Nine",  desc: "Arabic numeral nine." },
    ],
  },
  {
    name: "Chinese Numerals",
    chars: [
      { label: "零", name: "Líng",  desc: "Zero (0). Used in formal and spoken Chinese." },
      { label: "一", name: "Yī",    desc: "One (1). The simplest Chinese character — a single horizontal stroke." },
      { label: "二", name: "Èr",    desc: "Two (2). Two horizontal strokes." },
      { label: "三", name: "Sān",   desc: "Three (3). Three horizontal strokes." },
      { label: "四", name: "Sì",    desc: "Four (4)." },
      { label: "五", name: "Wǔ",    desc: "Five (5)." },
      { label: "六", name: "Liù",   desc: "Six (6)." },
      { label: "七", name: "Qī",    desc: "Seven (7)." },
      { label: "八", name: "Bā",    desc: "Eight (8). Considered lucky in Chinese culture." },
      { label: "九", name: "Jiǔ",   desc: "Nine (9). Also means 'long-lasting'." },
      { label: "十", name: "Shí",   desc: "Ten (10). A cross shape." },
      { label: "百", name: "Bǎi",   desc: "Hundred (100)." },
      { label: "千", name: "Qiān",  desc: "Thousand (1,000)." },
      { label: "万", name: "Wàn",   desc: "Ten thousand (10,000). A key unit in Chinese counting." },
      { label: "亿", name: "Yì",    desc: "Hundred million (100,000,000)." },
    ],
  },
  {
    name: "Kuzushiji Hiragana",
    chars: [
      { label: "お", name: "O",   desc: "Hiragana お (o). From the Kuzushiji-MNIST dataset of cursive Japanese." },
      { label: "き", name: "Ki",  desc: "Hiragana き (ki)." },
      { label: "す", name: "Su",  desc: "Hiragana す (su)." },
      { label: "つ", name: "Tsu", desc: "Hiragana つ (tsu)." },
      { label: "な", name: "Na",  desc: "Hiragana な (na)." },
      { label: "は", name: "Ha",  desc: "Hiragana は (ha)." },
      { label: "ま", name: "Ma",  desc: "Hiragana ま (ma)." },
      { label: "や", name: "Ya",  desc: "Hiragana や (ya)." },
      { label: "れ", name: "Re",  desc: "Hiragana れ (re)." },
      { label: "を", name: "Wo",  desc: "Hiragana を (wo). Mostly used as a grammatical particle." },
    ],
  },
];

export default function Sidebar({ open, onToggle }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* Toggle tab */}
      <button onClick={onToggle} style={{ ...s.tab, left: open ? 280 : 0 }}>
        {open ? "◀" : "▶"}
      </button>

      {/* Sidebar panel */}
      <div style={{ ...s.sidebar, transform: open ? "translateX(0)" : "translateX(-280px)" }}>
        <div style={s.scroll}>
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <div style={s.catHeader}>{cat.name}</div>
              <div style={s.grid}>
                {cat.chars.map((c) => (
                  <button
                    key={c.label}
                    style={{ ...s.chip, background: selected?.label === c.label ? "#2563eb" : "#e5e7eb", color: selected?.label === c.label ? "#fff" : "#111" }}
                    onClick={() => setSelected(selected?.label === c.label ? null : c)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info panel */}
        {selected && (
          <div style={s.info}>
            <span style={s.infoChar}>{selected.label}</span>
            <strong style={s.infoName}>{selected.name}</strong>
            <p style={s.infoDesc}>{selected.desc}</p>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  tab: {
    position: "fixed", top: "50%", transform: "translateY(-50%)",
    zIndex: 200, width: 24, height: 48,
    background: "#2563eb", color: "#fff", border: "none",
    borderRadius: "0 6px 6px 0", cursor: "pointer", fontSize: 14,
    transition: "left 0.3s",
  },
  sidebar: {
    position: "fixed", top: 0, left: 0, height: "100vh", width: 280,
    background: "#1e1e2e", color: "#fff", zIndex: 100,
    display: "flex", flexDirection: "column",
    transition: "transform 0.3s", boxShadow: "2px 0 12px rgba(0,0,0,0.3)",
  },
  scroll:    { flex: 1, overflowY: "auto", padding: "16px 12px" },
  catHeader: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "16px 0 8px" },
  grid:      { display: "flex", flexWrap: "wrap", gap: 6 },
  chip:      { width: 36, height: 36, borderRadius: 6, border: "none", fontSize: 18, cursor: "pointer", transition: "background 0.15s" },
  info:      { borderTop: "1px solid #333", padding: 16, display: "flex", flexDirection: "column", gap: 4 },
  infoChar:  { fontSize: 48, lineHeight: 1, textAlign: "center" },
  infoName:  { fontSize: 16, textAlign: "center", color: "#93c5fd" },
  infoDesc:  { fontSize: 13, color: "#aaa", margin: 0, textAlign: "center" },
};
