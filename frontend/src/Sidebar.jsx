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
  {
    name: "Korean Hangul Syllables",
    chars: [
      { label: "아", name: "A",      desc: "아 (a). One of the most common syllables in Korean. The vowel ㅏ is written to the right of the consonant ㅇ, a silent placeholder." },
      { label: "박", name: "Bak",    desc: "박 (bak). A common Korean surname. Composed of ㅂ (b) + ㅏ (a) + ㄱ (k) stacked into a single block." },
      { label: "보", name: "Bo",     desc: "보 (bo). Means 'to see' or 'step'. Hangul syllable blocks always combine an initial consonant, vowel, and optional final consonant." },
      { label: "부", name: "Bu",     desc: "부 (bu). Means 'part' or 'wealth'. The vowel ㅜ sits below the consonant ㅂ, giving the block a vertical arrangement." },
      { label: "최", name: "Choe",   desc: "최 (choe). A common Korean surname. The complex vowel ㅚ (oe) is one of the trickier sounds for non-native speakers." },
      { label: "다", name: "Da",     desc: "다 (da). Means 'all' or 'many'. Also the verb ending for plain-style statements in Korean." },
      { label: "대", name: "Dae",    desc: "대 (dae). Means 'big' or 'great'. Appears in 대한민국 (Daehanminguk) — the official name of South Korea." },
      { label: "들", name: "Deul",   desc: "들 (deul). The Korean plural marker — added to nouns to indicate multiple items, though often omitted in casual speech." },
      { label: "도", name: "Do",     desc: "도 (do). Means 'also' or 'road'. As a particle it adds the meaning 'too' or 'even' to a noun." },
      { label: "동", name: "Dong",   desc: "동 (dong). Means 'east' or 'district'. Appears in 동대문 (Dongdaemun), the Great East Gate of Seoul." },
      { label: "에", name: "E",      desc: "에 (e). A location/direction particle meaning 'at', 'in', or 'to'. One of the most frequently used particles in Korean." },
      { label: "어", name: "Eo",     desc: "어 (eo). The vowel ㅓ is often described as the 'uh' sound. 어 alone is an interjection expressing surprise or hesitation." },
      { label: "으", name: "Eu",     desc: "으 (eu). The neutral vowel ㅡ has no direct equivalent in English — it's pronounced with the mouth barely open." },
      { label: "의", name: "Eui",    desc: "의 (eui/ui). The possessive particle in Korean, equivalent to 's or 'of'. Its pronunciation shifts depending on context." },
      { label: "을", name: "Eul",    desc: "을 (eul). The object particle used after syllables ending in a consonant. Its counterpart 를 is used after vowel-ending syllables." },
      { label: "은", name: "Eun",    desc: "은 (eun). The topic particle used after consonant-ending syllables. It marks what the sentence is about." },
      { label: "가", name: "Ga",     desc: "가 (ga). The subject particle used after vowel-ending syllables. Also means 'to go' as a verb stem." },
      { label: "것", name: "Geos",   desc: "것 (geos). Means 'thing' or 'fact'. Extremely common in Korean grammar — 것이다 is used to make noun-based predicate sentences." },
      { label: "그", name: "Geu",    desc: "그 (geu). Means 'that' (near the listener) or 'he/him'. Korean pronouns are often omitted when context is clear." },
      { label: "김", name: "Gim",    desc: "김 (gim). The most common Korean surname, shared by about 22% of the population. Also means 'seaweed'." },
      { label: "고", name: "Go",     desc: "고 (go). A connective ending meaning 'and' between verb clauses. Also means 'high' or 'ancient'." },
      { label: "공", name: "Gong",   desc: "공 (gong). Means 'ball', 'zero', or 'public'. The character for zero in Korean phone numbers is often read as 공." },
      { label: "구", name: "Gu",     desc: "구 (gu). Means 'nine', 'district', or 'old'. 구 as a district marker appears in Seoul borough names like 강남구." },
      { label: "국", name: "Guk",    desc: "국 (guk). Means 'country' or 'soup'. 한국 (Hanguk) is the Korean word for Korea — literally 'Han country'." },
      { label: "과", name: "Gwa",    desc: "과 (gwa). The conjunction 'and' used between nouns after a consonant. Its counterpart 와 is used after vowels." },
      { label: "계", name: "Gye",    desc: "계 (gye). Means 'system', 'world', or 'season'. Appears in 계절 (gyejeol, season) and 세계 (segye, world)." },
      { label: "경", name: "Gyeong", desc: "경 (gyeong). Means 'capital' or 'scenery'. 서울특별시 was historically called 경성 (Gyeongseong) during the Japanese colonial period." },
      { label: "하", name: "Ha",     desc: "하 (ha). The verb stem meaning 'to do'. 하다 verbs are the most productive class in Korean — almost any noun can become a verb with 하다." },
      { label: "해", name: "Hae",    desc: "해 (hae). Means 'sun', 'year', or 'sea'. 해돋이 (haedoji) means sunrise — literally 'the sun rising'." },
      { label: "한", name: "Han",    desc: "한 (han). Means 'Korean', 'one', or 'great'. 한글 (Hangeul) means 'Korean script' — the writing system invented in 1443." },
      { label: "화", name: "Hwa",    desc: "화 (hwa). Means 'fire', 'flower', or 'Tuesday' (화요일). The five-day cycle in Korean uses the five elements." },
      { label: "이", name: "I",      desc: "이 (i). Means 'this', 'two', or 'tooth'. As a subject particle it follows vowel-ending nouns. Also a common surname." },
      { label: "일", name: "Il",     desc: "일 (il). Means 'one', 'work', or 'Japan'. 일요일 (iryoil) is Sunday — literally 'sun day', matching the Western convention." },
      { label: "인", name: "In",     desc: "인 (in). Means 'person' or 'seal'. Appears in 인간 (ingan, human being) and 인터넷 (inteonet, internet)." },
      { label: "있", name: "Iss",    desc: "있 (iss). The stem of 있다, meaning 'to exist' or 'to have'. One of the two most fundamental verbs in Korean alongside 없다 (to not exist)." },
      { label: "자", name: "Ja",     desc: "자 (ja). Means 'letter/character', 'ruler (measuring tool)', or 'sleep'. 한자 (hanja) means Chinese characters used in Korean." },
      { label: "장", name: "Jang",   desc: "장 (jang). Means 'chapter', 'market', or 'general'. 시장 (sijang) means both 'market' and 'mayor' — same pronunciation, different characters." },
      { label: "제", name: "Je",     desc: "제 (je). Means 'my' (humble form), 'system', or 'ordinal prefix'. 제1 means 'number one' or 'first'." },
      { label: "적", name: "Jeok",   desc: "적 (jeok). Means 'enemy', 'red', or a nominalizing suffix. 적 turns adjectives into nouns: 역사적 (yeoksajeok) means 'historical'." },
      { label: "전", name: "Jeon",   desc: "전 (jeon). Means 'before', 'electricity', or 'battle'. 전화 (jeonhwa) means 'telephone' — literally 'electric speech'." },
      { label: "정", name: "Jeong",  desc: "정 (jeong). Means 'correct', 'government', or 'affection'. 정 (jeong) as an emotional concept describes deep attachment unique to Korean culture." },
      { label: "지", name: "Ji",     desc: "지 (ji). Means 'earth', 'paper', or a sentence-ending particle indicating elapsed time. 지하 (jiha) means underground." },
      { label: "조", name: "Jo",     desc: "조 (jo). Means 'ancestor', 'trillion', or 'tune'. 조선 (Joseon) was the Korean dynasty that ruled from 1392 to 1897." },
      { label: "주", name: "Ju",     desc: "주 (ju). Means 'week', 'main', or 'state/province'. 주말 (jumal) means weekend — literally 'end of the week'." },
      { label: "나", name: "Na",     desc: "나 (na). The informal first-person pronoun 'I/me'. The formal equivalent is 저 (jeo), used in polite speech." },
      { label: "는", name: "Neun",   desc: "는 (neun). The topic particle used after vowel-ending syllables. It often implies contrast: '나는' can mean 'as for me (but others may differ)'." },
      { label: "라", name: "Ra",     desc: "라 (ra). Appears in quotative endings and the particle 라고 (rago, 'called' or 'saying'). Also a common syllable in names." },
      { label: "를", name: "Reul",   desc: "를 (reul). The object particle used after vowel-ending syllables. Marks the direct object of a verb." },
      { label: "리", name: "Ri",     desc: "리 (ri). Means 'village', 'reason', or 'mile'. 이유 and 도리 both use 리 in the sense of reason or principle." },
      { label: "로", name: "Ro",     desc: "로 (ro). A directional/instrumental particle meaning 'to', 'by means of', or 'as'. Used after consonant-ending syllables (으로 after most consonants)." },
      { label: "사", name: "Sa",     desc: "사 (sa). Means 'four', 'company', or 'history'. 역사 (yeoksa) means history; 회사 (hoesa) means company." },
      { label: "상", name: "Sang",   desc: "상 (sang). Means 'above', 'prize', or 'table'. 상황 (sanghwang) means situation; 이상 (isang) means ideal or above." },
      { label: "서", name: "Seo",    desc: "서 (seo). Means 'west' or 'book'. 서울 (Seoul) may derive from an old word for capital. 서점 (seojeom) means bookstore." },
      { label: "성", name: "Seong",  desc: "성 (seong). Means 'surname', 'castle', or 'nature'. Korean surnames (성씨, seongssi) are placed before given names." },
      { label: "스", name: "Seu",    desc: "스 (seu). Primarily used in loanwords — 스트레스 (stress), 스마트폰 (smartphone). Korean adapts foreign words using native syllable blocks." },
      { label: "시", name: "Si",     desc: "시 (si). Means 'city', 'time', or 'poem'. 서울시 (Seoul-si) means Seoul City; 시간 (sigan) means time." },
      { label: "소", name: "So",     desc: "소 (so). Means 'small', 'cow', or 'place'. 소개 (sogae) means introduction; 소설 (soseol) means novel." },
      { label: "수", name: "Su",     desc: "수 (su). Means 'number', 'water', or 'ability'. 수학 (suhak) means mathematics — literally 'number study'." },
      { label: "위", name: "Wi",     desc: "위 (wi). Means 'above', 'stomach', or 'rank'. 위치 (wichi) means location; 위험 (wiheom) means danger." },
      { label: "원", name: "Won",    desc: "원 (won). Means 'circle', 'Korean currency (₩)', or 'wish'. The won (₩) has been South Korea's currency since 1962." },
      { label: "여", name: "Yeo",    desc: "여 (yeo). Means 'woman' or 'travel'. 여행 (yeohaeng) means travel; 여자 (yeoja) means woman." },
      { label: "연", name: "Yeon",   desc: "연 (yeon). Means 'year', 'kite', or 'connection'. 연결 (yeongyeol) means connection; 연습 (yeonseup) means practice." },
      { label: "용", name: "Yong",   desc: "용 (yong). Means 'dragon' or 'use'. Dragons in Korean culture are benevolent water deities, unlike the fearsome Western dragon." },
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
