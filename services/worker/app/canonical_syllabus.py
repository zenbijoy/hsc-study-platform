from __future__ import annotations

import difflib
import re
from typing import Any

from app.models import CanonicalChapter, ChapterCandidate

SUBJECT_ALIASES: dict[str, list[str]] = {
    "physics": ["physics", "পদার্থবিজ্ঞান", "পদার্থ", "phy", "hsc physics"],
    "chemistry": ["chemistry", "রসায়ন", "রসায়ন", "chem", "hsc chemistry"],
    "mathematics": [
        "mathematics",
        "math",
        "higher math",
        "উচ্চতর গণিত",
        "গণিত",
        "maths",
        "hsc higher math",
    ],
    "biology": ["biology", "জীববিজ্ঞান", "জীব", "bio", "botany", "zoology", "উদ্ভিদবিজ্ঞান", "প্রাণিবিজ্ঞান"],
    "ict": [
        "ict",
        "information and communication technology",
        "তথ্য ও যোগাযোগ প্রযুক্তি",
        "তথ্য প্রযুক্তি",
        "আইসিটি",
    ],
}

PAPER_1_ALIASES = ["1st", "1st paper", "paper 1", "১ম", "১ম পত্র", "প্রথম", "প্রথম পত্র", "first", "first paper"]
PAPER_2_ALIASES = [
    "2nd",
    "2nd paper",
    "paper 2",
    "২য়",
    "২য়",
    "২য় পত্র",
    "২য় পত্র",
    "দ্বিতীয়",
    "দ্বিতীয়",
    "দ্বিতীয় পত্র",
    "second",
    "second paper",
]

# NCTB Canonical HSC Syllabus Chapters
CANONICAL_CHAPTERS: list[CanonicalChapter] = [
    # Physics Paper 1
    CanonicalChapter(id="phy1_ch1", subject_id="physics", paper=1, chapter_number=1, title_bn="ভৌতজগৎ ও পরিমাপ", title_en="Physical World and Measurement", aliases=["Physical World", "ভৌত জগৎ ও পরিমাপ", "পরিমাপ"]),
    CanonicalChapter(id="phy1_ch2", subject_id="physics", paper=1, chapter_number=2, title_bn="ভেক্টর", title_en="Vectors", aliases=["Vector", "ভেক্টর"]),
    CanonicalChapter(id="phy1_ch3", subject_id="physics", paper=1, chapter_number=3, title_bn="গতিবিদ্যা", title_en="Dynamics", aliases=["Kinematics", "Motion", "গতিবিদ্যা"]),
    CanonicalChapter(id="phy1_ch4", subject_id="physics", paper=1, chapter_number=4, title_bn="নিউটনীয় বলবিদ্যা", title_en="Newtonian Mechanics", aliases=["Newtonian", "বলবিদ্যা", "নিউটনীয় বলবিদ্যা", "Newton's Laws"]),
    CanonicalChapter(id="phy1_ch5", subject_id="physics", paper=1, chapter_number=5, title_bn="কাজ, শক্তি ও ক্ষমতা", title_en="Work, Energy and Power", aliases=["Work Energy Power", "কাজ শক্তি ও ক্ষমতা"]),
    CanonicalChapter(id="phy1_ch6", subject_id="physics", paper=1, chapter_number=6, title_bn="মহাকর্ষ ও অভিকর্ষ", title_en="Gravitation and Gravity", aliases=["Gravitation", "মহাকর্ষ"]),
    CanonicalChapter(id="phy1_ch7", subject_id="physics", paper=1, chapter_number=7, title_bn="পদার্থের গাঠনিক ধর্ম", title_en="Structural Properties of Matter", aliases=["Properties of Matter", "গাঠনিক ধর্ম"]),
    CanonicalChapter(id="phy1_ch8", subject_id="physics", paper=1, chapter_number=8, title_bn="পর্যায়বৃত্ত গতি", title_en="Periodic Motion", aliases=["Periodic Motion", "পর্যায়বৃত্ত গতি"]),
    CanonicalChapter(id="phy1_ch9", subject_id="physics", paper=1, chapter_number=9, title_bn="তরঙ্গ", title_en="Waves", aliases=["Wave", "তরঙ্গ"]),
    CanonicalChapter(id="phy1_ch10", subject_id="physics", paper=1, chapter_number=10, title_bn="আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব", title_en="Ideal Gas and Kinetic Theory of Gases", aliases=["Ideal Gas", "গ্যাসের গতিতত্ত্ব", "আদর্শ গ্যাস"]),

    # Physics Paper 2
    CanonicalChapter(id="phy2_ch1", subject_id="physics", paper=2, chapter_number=1, title_bn="তাপগতিবিদ্যা", title_en="Thermodynamics", aliases=["Thermodynamics", "তাপগতিবিদ্যা"]),
    CanonicalChapter(id="phy2_ch2", subject_id="physics", paper=2, chapter_number=2, title_bn="স্থির তড়িৎ", title_en="Static Electricity", aliases=["Electrostatics", "Static Electricity", "স্থির তড়িৎ", "স্থিরতড়িৎ"]),
    CanonicalChapter(id="phy2_ch3", subject_id="physics", paper=2, chapter_number=3, title_bn="চল তড়িৎ", title_en="Current Electricity", aliases=["Current Electricity", "চল তড়িৎ", "চলতড়িৎ"]),
    CanonicalChapter(id="phy2_ch4", subject_id="physics", paper=2, chapter_number=4, title_bn="তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব", title_en="Magnetic Effects of Current and Magnetism", aliases=["Magnetism", "চুম্বকত্ব", "চৌম্বক ক্রিয়া"]),
    CanonicalChapter(id="phy2_ch5", subject_id="physics", paper=2, chapter_number=5, title_bn="তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ", title_en="Electromagnetic Induction and Alternating Current", aliases=["Electromagnetic Induction", "AC Current", "তাড়িতচৌম্বকীয় আবেশ"]),
    CanonicalChapter(id="phy2_ch6", subject_id="physics", paper=2, chapter_number=6, title_bn="জ্যামিতিক আলোকবিজ্ঞান", title_en="Geometrical Optics", aliases=["Geometrical Optics", "জ্যামিতিক আলোকবিজ্ঞান"]),
    CanonicalChapter(id="phy2_ch7", subject_id="physics", paper=2, chapter_number=7, title_bn="ভৌত আলোকবিজ্ঞান", title_en="Physical Optics", aliases=["Physical Optics", "ভৌত আলোকবিজ্ঞান", "আলোকবিজ্ঞান"]),
    CanonicalChapter(id="phy2_ch8", subject_id="physics", paper=2, chapter_number=8, title_bn="আধুনিক পদার্থবিজ্ঞানের সূচনা", title_en="Introduction to Modern Physics", aliases=["Modern Physics", "আধুনিক পদার্থবিজ্ঞান"]),
    CanonicalChapter(id="phy2_ch9", subject_id="physics", paper=2, chapter_number=9, title_bn="পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান", title_en="Atomic Model and Nuclear Physics", aliases=["Nuclear Physics", "Atomic Model", "নিউক্লিয়ার পদার্থবিজ্ঞান"]),
    CanonicalChapter(id="phy2_ch10", subject_id="physics", paper=2, chapter_number=10, title_bn="সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", title_en="Semiconductors and Electronics", aliases=["Semiconductor", "Electronics", "সেমিকন্ডাক্টর"]),
    CanonicalChapter(id="phy2_ch11", subject_id="physics", paper=2, chapter_number=11, title_bn="জ্যোতির্বিজ্ঞান", title_en="Astronomy", aliases=["Astronomy", "জ্যোতির্বিজ্ঞান"]),

    # Chemistry Paper 1
    CanonicalChapter(id="chem1_ch1", subject_id="chemistry", paper=1, chapter_number=1, title_bn="ল্যাবরেটরির নিরাপদ ব্যবহার", title_en="Safe Use of Laboratory", aliases=["Laboratory Safety", "ল্যাবরেটরি"]),
    CanonicalChapter(id="chem1_ch2", subject_id="chemistry", paper=1, chapter_number=2, title_bn="গুণগত রসায়ন", title_en="Qualitative Chemistry", aliases=["Qualitative Chemistry", "গুণগত রসায়ন"]),
    CanonicalChapter(id="chem1_ch3", subject_id="chemistry", paper=1, chapter_number=3, title_bn="মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", title_en="Periodic Properties of Elements and Chemical Bonding", aliases=["Periodic Table", "Chemical Bonding", "পর্যায়বৃত্ত ধর্ম", "রাসায়নিক বন্ধন"]),
    CanonicalChapter(id="chem1_ch4", subject_id="chemistry", paper=1, chapter_number=4, title_bn="রাসায়নিক পরিবর্তন", title_en="Chemical Changes", aliases=["Chemical Change", "Equilibrium", "রাসায়নিক পরিবর্তন"]),
    CanonicalChapter(id="chem1_ch5", subject_id="chemistry", paper=1, chapter_number=5, title_bn="কর্মমুখী রসায়ন", title_en="Applied Chemistry", aliases=["Applied Chemistry", "কর্মমুখী রসায়ন"]),

    # Chemistry Paper 2
    CanonicalChapter(id="chem2_ch1", subject_id="chemistry", paper=2, chapter_number=1, title_bn="পরিবেশ রসায়ন", title_en="Environmental Chemistry", aliases=["Environmental Chemistry", "পরিবেশ রসায়ন"]),
    CanonicalChapter(id="chem2_ch2", subject_id="chemistry", paper=2, chapter_number=2, title_bn="জৈব রসায়ন", title_en="Organic Chemistry", aliases=["Organic Chemistry", "জৈব রসায়ন", "Organic"]),
    CanonicalChapter(id="chem2_ch3", subject_id="chemistry", paper=2, chapter_number=3, title_bn="পরিমাণগত রসায়ন", title_en="Quantitative Chemistry", aliases=["Quantitative Chemistry", "পরিমাণগত রসায়ন", "Stoichiometry"]),
    CanonicalChapter(id="chem2_ch4", subject_id="chemistry", paper=2, chapter_number=4, title_bn="তড়িৎ রসায়ন", title_en="Electrochemistry", aliases=["Electrochemistry", "তড়িৎ রসায়ন"]),
    CanonicalChapter(id="chem2_ch5", subject_id="chemistry", paper=2, chapter_number=5, title_bn="অর্থনৈতিক রসায়ন", title_en="Economic Chemistry", aliases=["Economic Chemistry", "অর্থনৈতিক রসায়ন"]),

    # Higher Math Paper 1
    CanonicalChapter(id="math1_ch1", subject_id="mathematics", paper=1, chapter_number=1, title_bn="ম্যাট্রিক্স ও নির্ণায়ক", title_en="Matrices and Determinants", aliases=["Matrix", "Determinants", "ম্যাট্রিক্স", "নির্ণায়ক"]),
    CanonicalChapter(id="math1_ch2", subject_id="mathematics", paper=1, chapter_number=2, title_bn="ভেক্টর", title_en="Vectors", aliases=["Vector Math", "ভেক্টর"]),
    CanonicalChapter(id="math1_ch3", subject_id="mathematics", paper=1, chapter_number=3, title_bn="সরলরেখা", title_en="Straight Lines", aliases=["Straight Line", "সরলরেখা"]),
    CanonicalChapter(id="math1_ch4", subject_id="mathematics", paper=1, chapter_number=4, title_bn="বৃত্ত", title_en="Circles", aliases=["Circle", "বৃত্ত"]),
    CanonicalChapter(id="math1_ch5", subject_id="mathematics", paper=1, chapter_number=5, title_bn="বিন্যাস ও সমাবেশ", title_en="Permutations and Combinations", aliases=["Permutation Combination", "বিন্যাস ও সমাবেশ", "বিন্যাস"]),
    CanonicalChapter(id="math1_ch6", subject_id="mathematics", paper=1, chapter_number=6, title_bn="ত্রিকোণমিতিক অনুপাত", title_en="Trigonometric Ratios", aliases=["Trigonometry", "ত্রিকোণমিতি"]),
    CanonicalChapter(id="math1_ch7", subject_id="mathematics", paper=1, chapter_number=7, title_bn="সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত", title_en="Trigonometric Ratios of Associated Angles", aliases=["Associated Angles", "সংযুক্ত কোণ"]),
    CanonicalChapter(id="math1_ch8", subject_id="mathematics", paper=1, chapter_number=8, title_bn="ফাংশন ও ফাংশনের লেখচিত্র", title_en="Functions and Graphs", aliases=["Functions", "ফাংশন"]),
    CanonicalChapter(id="math1_ch9", subject_id="mathematics", paper=1, chapter_number=9, title_bn="অন্তরীকরণ", title_en="Differentiation", aliases=["Calculus Differentiation", "অন্তরীকরণ", "Differentiation", "Derivative"]),
    CanonicalChapter(id="math1_ch10", subject_id="mathematics", paper=1, chapter_number=10, title_bn="যোগজীকরণ", title_en="Integration", aliases=["Integration", "যোগজীকরণ", "Integrals"]),

    # Higher Math Paper 2
    CanonicalChapter(id="math2_ch1", subject_id="mathematics", paper=2, chapter_number=1, title_bn="বাস্তব সংখ্যা ও অসমতা", title_en="Real Numbers and Inequalities", aliases=["Real Numbers", "বাস্তব সংখ্যা", "অসমতা"]),
    CanonicalChapter(id="math2_ch2", subject_id="mathematics", paper=2, chapter_number=2, title_bn="যোগাশ্রয়ী প্রোগ্রাম", title_en="Linear Programming", aliases=["Linear Programming", "যোগাশ্রয়ী"]),
    CanonicalChapter(id="math2_ch3", subject_id="mathematics", paper=2, chapter_number=3, title_bn="জটিল সংখ্যা", title_en="Complex Numbers", aliases=["Complex Number", "জটিল সংখ্যা"]),
    CanonicalChapter(id="math2_ch4", subject_id="mathematics", paper=2, chapter_number=4, title_bn="বহুপদী ও বহুপদী সমীকরণ", title_en="Polynomials and Polynomial Equations", aliases=["Polynomials", "বহুপদী"]),
    CanonicalChapter(id="math2_ch5", subject_id="mathematics", paper=2, chapter_number=5, title_bn="দ্বিপদী বিস্তার", title_en="Binomial Expansion", aliases=["Binomial Theorem", "দ্বিপদী বিস্তার"]),
    CanonicalChapter(id="math2_ch6", subject_id="mathematics", paper=2, chapter_number=6, title_bn="কণিক", title_en="Conics", aliases=["Conic", "কণিক", "Parabola", "Ellipse", "Hyperbola"]),
    CanonicalChapter(id="math2_ch7", subject_id="mathematics", paper=2, chapter_number=7, title_bn="বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ", title_en="Inverse Trigonometric Functions and Equations", aliases=["Inverse Trigonometry", "বিপরীত ত্রিকোণমিতি"]),
    CanonicalChapter(id="math2_ch8", subject_id="mathematics", paper=2, chapter_number=8, title_bn="স্থিতিবিদ্যা", title_en="Statics", aliases=["Statics", "স্থিতিবিদ্যা"]),
    CanonicalChapter(id="math2_ch9", subject_id="mathematics", paper=2, chapter_number=9, title_bn="সমতলে বস্তুকণার গতি", title_en="Motion of Particles in a Plane", aliases=["Planar Motion", "বস্তুকণার গতি"]),
    CanonicalChapter(id="math2_ch10", subject_id="mathematics", paper=2, chapter_number=10, title_bn="বিস্তার পরিমাপ ও সম্ভাবনা", title_en="Measures of Dispersion and Probability", aliases=["Probability", "সম্ভাবনা", "বিস্তার পরিমাপ"]),

    # Biology Paper 1 (Botany)
    CanonicalChapter(id="bio1_ch1", subject_id="biology", paper=1, chapter_number=1, title_bn="কোষ ও এর গঠন", title_en="Cell and its Structure", aliases=["Cell Structure", "কোষ"]),
    CanonicalChapter(id="bio1_ch2", subject_id="biology", paper=1, chapter_number=2, title_bn="কোষ বিভাজন", title_en="Cell Division", aliases=["Cell Division", "কোষ বিভাজন", "Mitosis", "Meiosis"]),
    CanonicalChapter(id="bio1_ch3", subject_id="biology", paper=1, chapter_number=3, title_bn="কোষ রসায়ন", title_en="Cell Chemistry", aliases=["Biomolecules", "কোষ রসায়ন"]),
    CanonicalChapter(id="bio1_ch4", subject_id="biology", paper=1, chapter_number=4, title_bn="অণুজীব", title_en="Microorganisms", aliases=["Microbiology", "অণুজীব", "Virus", "Bacteria"]),
    CanonicalChapter(id="bio1_ch5", subject_id="biology", paper=1, chapter_number=5, title_bn="শৈবাল ও ছত্রাক", title_en="Algae and Fungi", aliases=["Algae Fungi", "শৈবাল ও ছত্রাক"]),

    # Biology Paper 2 (Zoology)
    CanonicalChapter(id="bio2_ch1", subject_id="biology", paper=2, chapter_number=1, title_bn="প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস", title_en="Diversity and Classification of Animals", aliases=["Animal Classification", "শ্রেণিবিন্যাস"]),
    CanonicalChapter(id="bio2_ch2", subject_id="biology", paper=2, chapter_number=2, title_bn="প্রাণীর পরিচিতি", title_en="Introduction to Animals", aliases=["Hydra", "Grasshopper", "Rohu", "প্রাণীর পরিচিতি"]),
    CanonicalChapter(id="bio2_ch3", subject_id="biology", paper=2, chapter_number=3, title_bn="মানব শারীরতত্ত্ব: পরিপাক ও শোষণ", title_en="Human Physiology: Digestion and Absorption", aliases=["Digestion", "পরিপাক"]),
    CanonicalChapter(id="bio2_ch4", subject_id="biology", paper=2, chapter_number=4, title_bn="মানব শারীরতত্ত্ব: রক্ত ও সংবহন", title_en="Human Physiology: Blood and Circulation", aliases=["Circulation", "রক্ত ও সংবহন", "Blood"]),

    # ICT
    CanonicalChapter(id="ict_ch1", subject_id="ict", paper=1, chapter_number=1, title_bn="তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত", title_en="ICT: Global and Bangladesh Perspective", aliases=["Global Perspective", "তথ্য ও যোগাযোগ প্রযুক্তি প্রেক্ষিত"]),
    CanonicalChapter(id="ict_ch2", subject_id="ict", paper=1, chapter_number=2, title_bn="কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং", title_en="Communication Systems and Networking", aliases=["Networking", "কমিউনিকেশন সিস্টেমস"]),
    CanonicalChapter(id="ict_ch3", subject_id="ict", paper=1, chapter_number=3, title_bn="সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", title_en="Number Systems and Digital Devices", aliases=["Number System", "Logic Gates", "সংখ্যা পদ্ধতি", "ডিজিটাল ডিভাইস"]),
    CanonicalChapter(id="ict_ch4", subject_id="ict", paper=1, chapter_number=4, title_bn="ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল", title_en="Introduction to Web Design and HTML", aliases=["HTML", "Web Design", "ওয়েব ডিজাইন"]),
    CanonicalChapter(id="ict_ch5", subject_id="ict", paper=1, chapter_number=5, title_bn="প্রোগ্রামিং ভাষা", title_en="Programming Language", aliases=["C Programming", "Programming", "প্রোগ্রামিং"]),
    CanonicalChapter(id="ict_ch6", subject_id="ict", paper=1, chapter_number=6, title_bn="ডেটাবেজ ম্যানেজমেন্ট সিস্টেম", title_en="Database Management System", aliases=["DBMS", "SQL", "ডেটাবেজ"]),
]


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"[_.\-–—:,;()\[\]{}]+", " ", text)
    return " ".join(cleaned.lower().split())


def resolve_subject_alias(text: str) -> str | None:
    norm = normalize_text(text)
    for canonical_id, aliases in SUBJECT_ALIASES.items():
        for alias in aliases:
            if re.search(r"\b" + re.escape(alias) + r"\b", norm, re.I):
                return canonical_id
    return None


def resolve_paper_alias(text: str) -> int | None:
    norm = normalize_text(text)
    for alias in PAPER_2_ALIASES:
        if re.search(r"\b" + re.escape(alias) + r"\b", norm, re.I):
            return 2
    for alias in PAPER_1_ALIASES:
        if re.search(r"\b" + re.escape(alias) + r"\b", norm, re.I):
            return 1
    return None


def match_canonical_chapter(
    detected_title: str,
    subject_id: str,
    paper: int,
    fuzzy_threshold: float = 0.75,
) -> tuple[CanonicalChapter | None, float]:
    """Matches a detected chapter heading against canonical syllabus chapters."""
    norm_detected = normalize_text(detected_title)
    # Remove leading chapter numbers/words e.g. "Chapter 1: " or "১ম অধ্যায় "
    norm_detected = re.sub(r"^(?:chapter|ch|অধ্যায়|অধ্যায়|পরিচ্ছেদ)\s*[০-৯0-9ivx]+\s*[:.\-–—]?\s*", "", norm_detected).strip()

    candidates = [c for c in CANONICAL_CHAPTERS if c.subject_id == subject_id and c.paper == paper]
    if not candidates:
        return None, 0.0

    best_match: CanonicalChapter | None = None
    best_score = 0.0

    for ch in candidates:
        # 1. Exact string match against titles or aliases
        all_names = [ch.title_bn, ch.title_en] + ch.aliases
        for name in all_names:
            norm_name = normalize_text(name)
            if norm_name == norm_detected:
                return ch, 0.99
            if norm_name in norm_detected or norm_detected in norm_name:
                ratio = len(norm_name) / max(len(norm_detected), 1)
                if ratio > 0.6:
                    score = 0.94
                    if score > best_score:
                        best_score = score
                        best_match = ch

            # 2. Fuzzy sequence similarity
            similarity = difflib.SequenceMatcher(None, norm_name, norm_detected).ratio()
            if similarity > best_score:
                best_score = similarity
                best_match = ch

    if best_score >= fuzzy_threshold and best_match:
        return best_match, round(best_score, 3)
    return None, round(best_score, 3)


def validate_chapter_boundaries(chapters: list[ChapterCandidate], page_count: int) -> tuple[list[str], list[str]]:
    """Validates chapter start/end boundaries, ordering, overlaps, and range validity."""
    blocking_issues: list[str] = []
    warnings: list[str] = []

    for ch in chapters:
        if ch.start_page < 1:
            blocking_issues.append(f"Chapter '{ch.title}' has invalid start_page={ch.start_page} (< 1)")
        if ch.end_page is not None and ch.end_page > page_count:
            blocking_issues.append(f"Chapter '{ch.title}' end_page={ch.end_page} exceeds total pages ({page_count})")
        if ch.end_page is not None and ch.start_page > ch.end_page:
            blocking_issues.append(f"Chapter '{ch.title}' start_page={ch.start_page} > end_page={ch.end_page}")

    # Ordering & Overlap check
    for i in range(len(chapters) - 1):
        curr = chapters[i]
        nxt = chapters[i + 1]
        if nxt.start_page < curr.start_page:
            warnings.append(f"Chapter ordering anomaly: '{nxt.title}' (page {nxt.start_page}) starts before '{curr.title}' (page {curr.start_page})")
        if curr.end_page and nxt.start_page <= curr.end_page:
            warnings.append(f"Chapter overlap detected: '{curr.title}' (pages {curr.start_page}-{curr.end_page}) overlaps with '{nxt.title}' (page {nxt.start_page})")

    return blocking_issues, warnings
