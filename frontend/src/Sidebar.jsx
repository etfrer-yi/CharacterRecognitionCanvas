import { useState } from "react";

const CATEGORIES = [
  {
    name: "Western Digits",
    chars: [
      { label: "0", name: "Zero",  desc: "The only digit that is neither positive nor negative. Its circle shape may derive from a placeholder dot used in ancient Indian mathematics." },
      { label: "1", name: "One",   desc: "The only number that is neither prime nor composite. Every other number is built by multiplying ones." },
      { label: "2", name: "Two",   desc: "The only even prime number. All other even numbers are divisible by 2, making it uniquely both even and prime." },
      { label: "3", name: "Three", desc: "The first odd prime. Many cultures consider it magical — think trilogies, trinities, and three wishes." },
      { label: "4", name: "Four",  desc: "The only number whose name in English has the same number of letters as its value." },
      { label: "5", name: "Five",  desc: "The number of Platonic solids. Also the number of fingers on a hand, which is why we count in base 10." },
      { label: "6", name: "Six",   desc: "The first perfect number — equal to the sum of its divisors (1 + 2 + 3 = 6). The next one is 28." },
      { label: "7", name: "Seven", desc: "Consistently rated the world's favourite number in surveys. Also the number of notes in a musical scale." },
      { label: "8", name: "Eight", desc: "Rotate it 90° and you get ∞. In binary it's 1000 — the first four-digit binary number." },
      { label: "9", name: "Nine",  desc: "Any number multiplied by 9 has digits that sum to a multiple of 9. Try 9 × 7 = 63, and 6 + 3 = 9." },
    ],
  },
  {
    name: "Uppercase Letters",
    chars: [
      { label: "A", name: "A", desc: "Descended from the Phoenician letter aleph, originally drawn as an ox head. Rotate it 180° and you can still see the horns." },
      { label: "B", name: "B", desc: "Comes from the Phoenician beth, meaning 'house'. The two bumps may represent a floor plan viewed from the side." },
      { label: "C", name: "C", desc: "Derived from the Greek gamma (Γ), which was rounded over centuries of handwriting into its current crescent shape." },
      { label: "D", name: "D", desc: "From the Phoenician dalet, meaning 'door'. The straight edge is the doorpost; the curve is the door itself." },
      { label: "E", name: "E", desc: "The most common letter in English, appearing in about 13% of all text. It evolved from a Phoenician symbol for a window." },
      { label: "F", name: "F", desc: "Shares its ancestry with the letter V and U. The Romans used F and V interchangeably for the same sound for centuries." },
      { label: "G", name: "G", desc: "Invented by the Romans around 230 BC by adding a bar to C to distinguish the /g/ sound from /k/." },
      { label: "H", name: "H", desc: "From the Phoenician heth, a fence or wall. The two uprights are the posts; the crossbar is the rail." },
      { label: "I", name: "I", desc: "One of the simplest letters — a single stroke. In many early scripts it was just a vertical line with no serifs at all." },
      { label: "J", name: "J", desc: "One of the youngest letters in the alphabet, only fully distinguished from I in the 17th century." },
      { label: "K", name: "K", desc: "Relatively rare in English but common in many other languages. It comes from the Phoenician kaph, meaning 'palm of a hand'." },
      { label: "L", name: "L", desc: "From the Phoenician lamed, an ox goad. Its right-angle shape is one of the most stable in the Latin alphabet." },
      { label: "M", name: "M", desc: "Derived from the Phoenician mem, meaning 'water'. The zigzag shape may represent waves on a surface." },
      { label: "N", name: "N", desc: "From the Phoenician nun, meaning 'fish' or 'serpent'. The diagonal stroke is a later Roman simplification." },
      { label: "O", name: "O", desc: "One of the most universal letters — a circle appears in almost every writing system on Earth." },
      { label: "P", name: "P", desc: "From the Phoenician pe, meaning 'mouth'. The open bump at the top loosely resembles lips." },
      { label: "Q", name: "Q", desc: "Almost always followed by U in English. It comes from the Phoenician qoph, possibly depicting the back of a head." },
      { label: "R", name: "R", desc: "Evolved from P by adding a leg. In ancient Rome, the leg was added to distinguish R from P in stone inscriptions." },
      { label: "S", name: "S", desc: "Its sinuous shape has stayed remarkably consistent for over 3,000 years, from Phoenician shin to today." },
      { label: "T", name: "T", desc: "From the Phoenician taw, the last letter of that alphabet. The cross shape made it a symbol of completion." },
      { label: "U", name: "U", desc: "Only separated from V as a distinct letter in the 16th century. Before that, both sounds shared the same symbol." },
      { label: "V", name: "V", desc: "Romans used V for both the /u/ and /v/ sounds. The pointed base made it easy to chisel into stone." },
      { label: "W", name: "W", desc: "Literally a 'double U' — its name describes its origin as two U (or V) shapes written side by side." },
      { label: "X", name: "X", desc: "Used as a signature by illiterate people for centuries, then kissed to make it a promise. Hence X = a kiss." },
      { label: "Y", name: "Y", desc: "The Greeks added Y (upsilon) to represent a sound borrowed from Phoenician. It's one of only five letters the Romans took directly from Greek." },
      { label: "Z", name: "Z", desc: "The last letter in most alphabets derived from Phoenician. The Romans rarely used it — only in words borrowed from Greek." },
    ],
  },
  {
    name: "Lowercase Letters",
    chars: [
      { label: "a", name: "a", desc: "The two-storey 'a' used in print differs from the single-storey 'a' we learn to write by hand — both are the same letter." },
      { label: "b", name: "b", desc: "Easy to confuse with d, p, and q — they're all the same shape rotated or flipped. A common challenge in early reading." },
      { label: "d", name: "d", desc: "Mirror image of b. The bump faces right for d, left for b — a distinction that trips up many new readers." },
      { label: "e", name: "e", desc: "The most common letter in English. Its lowercase form evolved from a cursive version of the capital E." },
      { label: "f", name: "f", desc: "One of the trickiest letters to write consistently — the crossbar height varies widely across fonts and handwriting styles." },
      { label: "g", name: "g", desc: "Has two common printed forms: the single-storey g and the double-storey g. Most people can read both but can only write one." },
      { label: "h", name: "h", desc: "Shares its top half with n. The extra leg is the only thing that tells them apart at a glance." },
      { label: "n", name: "n", desc: "Flip it upside down and you get u. Rotate it 90° and you get a z-like shape — geometry hiding in plain sight." },
      { label: "q", name: "q", desc: "Almost always followed by u in English. Its tail hangs below the baseline, distinguishing it from d and p." },
      { label: "r", name: "r", desc: "One of the simplest lowercase letters — just a stem with a small shoulder. Its cursive form is far more elaborate." },
      { label: "t", name: "t", desc: "The crossbar sits below the top of the letter, unlike T. This small difference makes it one of the most recognisable lowercase forms." },
    ],
  },
  {
    name: "Chinese Numerals",
    chars: [
      { label: "零", name: "Líng",  desc: "Zero (0). Contains the rain radical (雨) at the top — historically, zero was associated with emptiness like a clear sky after rain." },
      { label: "一", name: "Yī",    desc: "One (1). The simplest Chinese character — a single horizontal stroke. Also means 'first' and 'unified'." },
      { label: "二", name: "Èr",    desc: "Two (2). Two horizontal strokes stacked. The upper stroke is shorter, giving it a sense of balance." },
      { label: "三", name: "Sān",   desc: "Three (3). Three horizontal strokes. Beyond three, Chinese numerals switch to more complex characters." },
      { label: "四", name: "Sì",    desc: "Four (4). Considered unlucky in many East Asian cultures because it sounds like the word for 'death' (死, sǐ)." },
      { label: "五", name: "Wǔ",    desc: "Five (5). Associated with the five elements (wood, fire, earth, metal, water) in Chinese philosophy." },
      { label: "六", name: "Liù",   desc: "Six (6). Considered lucky — it sounds like 'smooth' or 'flowing', suggesting things will go well." },
      { label: "七", name: "Qī",    desc: "Seven (7). Associated with togetherness in Chinese culture; the seventh day of the seventh month is a romantic holiday." },
      { label: "八", name: "Bā",    desc: "Eight (8). The luckiest number in Chinese culture — it sounds like 'prosper' (發, fā). Phone numbers with 8s sell for premiums." },
      { label: "九", name: "Jiǔ",   desc: "Nine (9). Sounds like 'long-lasting' (久, jiǔ), making it a symbol of longevity and eternity." },
      { label: "十", name: "Shí",   desc: "Ten (10). A perfect cross shape — one horizontal and one vertical stroke intersecting at the centre." },
      { label: "百", name: "Bǎi",   desc: "Hundred (100). The character contains 'one' (一) at the top, hinting at 'one hundred' as a complete unit." },
      { label: "千", name: "Qiān",  desc: "Thousand (1,000). Shares its top stroke with 十 (ten) — a visual reminder that 千 is a much larger scale." },
      { label: "万", name: "Wàn",   desc: "Ten thousand (10,000). Chinese counts in units of 万 rather than thousands — a million is 百万 (100 × 10,000)." },
      { label: "亿", name: "Yì",    desc: "Hundred million (100,000,000). China's population is often quoted in 亿 — about 14 亿 people." },
    ],
  },
  {
    name: "Kuzushiji Hiragana",
    chars: [
      { label: "お", name: "O",   desc: "Hiragana お (o). These are cursive forms from pre-modern Japanese manuscripts, collected in the Kuzushiji-MNIST dataset." },
      { label: "き", name: "Ki",  desc: "Hiragana き (ki). Kuzushiji script was the standard writing style in Japan for over a millennium before Western influence." },
      { label: "す", name: "Su",  desc: "Hiragana す (su). The looping tail is a hallmark of kuzushiji — strokes that would be separate in modern hiragana are joined." },
      { label: "つ", name: "Tsu", desc: "Hiragana つ (tsu). One of the most recognisable hiragana even in cursive form — its sweeping curve is hard to disguise." },
      { label: "な", name: "Na",  desc: "Hiragana な (na). In modern hiragana な has four strokes; in kuzushiji they blur into a single flowing movement." },
      { label: "は", name: "Ha",  desc: "Hiragana は (ha). Also romanised as 'wa' when used as the topic particle は in a sentence — same character, different reading." },
      { label: "ま", name: "Ma",  desc: "Hiragana ま (ma). Derived from the kanji 末. In kuzushiji the two horizontal strokes often merge into one." },
      { label: "や", name: "Ya",  desc: "Hiragana や (ya). Also appears as a small ゃ in combinations like きゃ (kya), where it modifies the preceding consonant." },
      { label: "れ", name: "Re",  desc: "Hiragana れ (re). Derived from the kanji 礼. Its looping descender makes it one of the more elegant hiragana." },
      { label: "を", name: "Wo",  desc: "Hiragana を (wo). Used almost exclusively as the object particle in modern Japanese — rarely appears in any other context." },
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
