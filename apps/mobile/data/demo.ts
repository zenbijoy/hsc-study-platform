export type Subject = {
  id: string;
  name: string;
  banglaName: string;
  icon: string;
  accent: string;
  bookCount: number;
  progress: number;
};

export type Chapter = {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  banglaTitle: string;
  startPage: number;
  endPage: number;
  formulaCount: number;
  cqCount: number;
  mcqCount: number;
};

export type Book = {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  publisher: string;
  pages: number;
  chapters: number;
  formulas: number;
  progress: number;
  lastPage: number;
  protected: boolean;
  publishedVersionId?: string;
  chapterList?: Chapter[];
};

export type FormulaVariable = {
  symbol: string;
  name: string;
  unit: string;
};

export type Formula = {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  latex: string;
  plain: string;
  importance: number;
  uses: number;
  explanation?: string;
  variables?: FormulaVariable[];
};

export type MCQQuestion = {
  id: string;
  subjectId: string;
  chapter: string;
  question: string;
  banglaQuestion?: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  board?: string;
  year?: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type CQSubQuestion = {
  letter: 'a' | 'b' | 'c' | 'd';
  banglaLetter: 'ক' | 'খ' | 'গ' | 'ঘ';
  question: string;
  marks: number;
  solution: string;
};

export type CQQuestion = {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  stimulus: string;
  subQuestions: CQSubQuestion[];
  board?: string;
  year?: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const subjects: Subject[] = [
  { id: 'physics', name: 'Physics', banglaName: 'পদার্থবিজ্ঞান', icon: 'atom-outline', accent: '#6CB7FF', bookCount: 18, progress: 64 },
  { id: 'chemistry', name: 'Chemistry', banglaName: 'রসায়ন', icon: 'flask-outline', accent: '#57E0B7', bookCount: 16, progress: 48 },
  { id: 'math', name: 'Higher Math', banglaName: 'উচ্চতর গণিত', icon: 'calculator-outline', accent: '#A58BFF', bookCount: 14, progress: 51 },
  { id: 'biology', name: 'Biology', banglaName: 'জীববিজ্ঞান', icon: 'leaf-outline', accent: '#FF8A76', bookCount: 15, progress: 39 }
];

export const demoChapters: Chapter[] = [
  { id: 'c-p1-1', bookId: 'demo-physics-1', chapterNumber: 1, title: 'Physical World & Measurement', banglaTitle: 'ভৌতজগৎ ও পরিমাপ', startPage: 1, endPage: 45, formulaCount: 12, cqCount: 18, mcqCount: 45 },
  { id: 'c-p1-2', bookId: 'demo-physics-1', chapterNumber: 2, title: 'Vectors', banglaTitle: 'ভেক্টর', startPage: 46, endPage: 118, formulaCount: 28, cqCount: 34, mcqCount: 82 },
  { id: 'c-p1-3', bookId: 'demo-physics-1', chapterNumber: 3, title: 'Dynamics & Motion', banglaTitle: 'গতিবিদ্যা', startPage: 119, endPage: 195, formulaCount: 35, cqCount: 42, mcqCount: 95 },
  { id: 'c-p1-4', bookId: 'demo-physics-1', chapterNumber: 4, title: 'Newtonian Mechanics', banglaTitle: 'নিউটনিয়ান বলবিদ্যা', startPage: 196, endPage: 284, formulaCount: 42, cqCount: 50, mcqCount: 110 },
  { id: 'c-p1-5', bookId: 'demo-physics-1', chapterNumber: 5, title: 'Work, Energy & Power', banglaTitle: 'কাজ, শক্তি ও ক্ষমতা', startPage: 285, endPage: 374, formulaCount: 31, cqCount: 38, mcqCount: 88 },
  { id: 'c-p1-6', bookId: 'demo-physics-1', chapterNumber: 6, title: 'Gravitation & Gravity', banglaTitle: 'মহাকর্ষ ও অভিকর্ষ', startPage: 375, endPage: 460, formulaCount: 26, cqCount: 30, mcqCount: 75 },
  { id: 'c-p1-7', bookId: 'demo-physics-1', chapterNumber: 7, title: 'Structural Properties of Matter', banglaTitle: 'পদার্থের গাঠনিক ধর্ম', startPage: 461, endPage: 540, formulaCount: 24, cqCount: 28, mcqCount: 70 },
  { id: 'c-p1-8', bookId: 'demo-physics-1', chapterNumber: 8, title: 'Periodic Motion', banglaTitle: 'পর্যাবৃত্ত গতি', startPage: 541, endPage: 630, formulaCount: 22, cqCount: 25, mcqCount: 65 },
  { id: 'c-p1-9', bookId: 'demo-physics-1', chapterNumber: 9, title: 'Waves & Sound', banglaTitle: 'তরঙ্গ', startPage: 631, endPage: 720, formulaCount: 21, cqCount: 24, mcqCount: 60 },
  { id: 'c-c1-1', bookId: 'demo-chem-1', chapterNumber: 1, title: 'Laboratory Safety', banglaTitle: 'ল্যাবরেটরির নিরাপদ ব্যবহার', startPage: 1, endPage: 52, formulaCount: 8, cqCount: 12, mcqCount: 40 },
  { id: 'c-c1-2', bookId: 'demo-chem-1', chapterNumber: 2, title: 'Qualitative Chemistry', banglaTitle: 'গুণগত রসায়ন', startPage: 53, endPage: 178, formulaCount: 34, cqCount: 45, mcqCount: 110 },
  { id: 'c-c1-3', bookId: 'demo-chem-1', chapterNumber: 3, title: 'Periodic Table & Chemical Bonds', banglaTitle: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', startPage: 179, endPage: 320, formulaCount: 46, cqCount: 52, mcqCount: 130 },
  { id: 'c-c1-4', bookId: 'demo-chem-1', chapterNumber: 4, title: 'Chemical Changes', banglaTitle: 'রাসায়নিক পরিবর্তন', startPage: 321, endPage: 440, formulaCount: 52, cqCount: 48, mcqCount: 120 },
  { id: 'c-c1-5', bookId: 'demo-chem-1', chapterNumber: 5, title: 'Applied Chemistry', banglaTitle: 'কর্মমুখী রসায়ন', startPage: 441, endPage: 544, formulaCount: 18, cqCount: 22, mcqCount: 65 }
];

export const books: Book[] = [
  {
    id: 'demo-physics-1',
    title: 'Physics 1st Paper',
    subtitle: 'Complete HSC Study Edition · National Curriculum',
    subjectId: 'physics',
    publisher: 'HSC Excellence Foundation',
    pages: 720,
    chapters: 9,
    formulas: 241,
    progress: 0.52,
    lastPage: 374,
    protected: true,
    publishedVersionId: 'v1-physics-hscp',
    chapterList: demoChapters.filter(c => c.bookId === 'demo-physics-1')
  },
  {
    id: 'demo-chem-1',
    title: 'Chemistry 1st Paper',
    subtitle: 'Concept + CQ + MCQ Board Standards',
    subjectId: 'chemistry',
    publisher: 'HSC Excellence Foundation',
    pages: 544,
    chapters: 5,
    formulas: 188,
    progress: 0.28,
    lastPage: 152,
    protected: true,
    publishedVersionId: 'v1-chem-hscp',
    chapterList: demoChapters.filter(c => c.bookId === 'demo-chem-1')
  },
  {
    id: 'demo-math-1',
    title: 'Higher Mathematics 1st Paper',
    subtitle: 'Matrices, Calculus & Coordinate Geometry',
    subjectId: 'math',
    publisher: 'HSC Excellence Foundation',
    pages: 610,
    chapters: 10,
    formulas: 312,
    progress: 0.41,
    lastPage: 210,
    protected: true,
    publishedVersionId: 'v1-math-hscp'
  },
  {
    id: 'demo-bio-1',
    title: 'Biology 1st Paper (Botany)',
    subtitle: 'Cell Biology, Genetics & Plant Physiology',
    subjectId: 'biology',
    publisher: 'HSC Excellence Foundation',
    pages: 480,
    chapters: 12,
    formulas: 95,
    progress: 0.15,
    lastPage: 64,
    protected: true,
    publishedVersionId: 'v1-bio-hscp'
  }
];

export const formulas: Formula[] = [
  {
    id: 'f-1',
    subjectId: 'physics',
    chapter: 'Dynamics & Motion',
    title: 'First Equation of Motion',
    latex: 'v = u + at',
    plain: 'v = u + at',
    importance: 5,
    uses: 124,
    explanation: 'Relates final velocity with initial velocity, constant linear acceleration, and elapsed time.',
    variables: [
      { symbol: 'v', name: 'Final Velocity', unit: 'm/s' },
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s' },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
      { symbol: 't', name: 'Time', unit: 's' }
    ]
  },
  {
    id: 'f-2',
    subjectId: 'physics',
    chapter: 'Dynamics & Motion',
    title: 'Displacement with Uniform Acceleration',
    latex: 's = ut + \\frac{1}{2}at^2',
    plain: 's = ut + ½at²',
    importance: 5,
    uses: 156,
    explanation: 'Calculates distance traveled under constant acceleration from rest or initial speed.',
    variables: [
      { symbol: 's', name: 'Displacement', unit: 'm' },
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s' },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
      { symbol: 't', name: 'Time', unit: 's' }
    ]
  },
  {
    id: 'f-3',
    subjectId: 'physics',
    chapter: 'Newtonian Mechanics',
    title: "Newton's Second Law of Motion",
    latex: 'F = ma = \\frac{dp}{dt}',
    plain: 'F = ma',
    importance: 5,
    uses: 210,
    explanation: 'The rate of change of momentum of a body is directly proportional to the applied net force.',
    variables: [
      { symbol: 'F', name: 'Net Force', unit: 'N (kg·m/s²)' },
      { symbol: 'm', name: 'Inertial Mass', unit: 'kg' },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' }
    ]
  },
  {
    id: 'f-4',
    subjectId: 'physics',
    chapter: 'Work, Energy & Power',
    title: 'Kinetic Energy Formula',
    latex: 'E_k = \\frac{1}{2}mv^2 = \\frac{p^2}{2m}',
    plain: 'Ek = ½mv² = p²/(2m)',
    importance: 5,
    uses: 180,
    explanation: 'Energy possessed by an object due to its motion. Relates directly with linear momentum (p).',
    variables: [
      { symbol: 'Ek', name: 'Kinetic Energy', unit: 'J (Joules)' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'v', name: 'Velocity', unit: 'm/s' },
      { symbol: 'p', name: 'Momentum', unit: 'kg·m/s' }
    ]
  },
  {
    id: 'f-5',
    subjectId: 'physics',
    chapter: 'Vectors',
    title: 'Resultant of Two Vectors',
    latex: 'R = \\sqrt{P^2 + Q^2 + 2PQ\\cos\\alpha}',
    plain: 'R = √(P² + Q² + 2PQ cos α)',
    importance: 5,
    uses: 195,
    explanation: 'Computes the magnitude of resultant vector R formed by two vectors P and Q at angle α.',
    variables: [
      { symbol: 'R', name: 'Resultant Vector', unit: 'Unit of P & Q' },
      { symbol: 'P, Q', name: 'Component Vectors', unit: 'N or m/s' },
      { symbol: 'α', name: 'Included Angle', unit: 'degrees / radians' }
    ]
  },
  {
    id: 'f-6',
    subjectId: 'chemistry',
    chapter: 'Qualitative Chemistry',
    title: 'Rydberg Equation for Hydrogen Emission',
    latex: '\\frac{1}{\\lambda} = \\bar{\\nu} = R_H \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)',
    plain: '1/λ = RH (1/n₁² - 1/n₂²)',
    importance: 4,
    uses: 88,
    explanation: 'Calculates the wavelength of emitted photon during electronic transitions in hydrogen-like atoms.',
    variables: [
      { symbol: 'λ', name: 'Wavelength', unit: 'm' },
      { symbol: 'RH', name: 'Rydberg Constant', unit: '1.09678 × 10⁷ m⁻¹' },
      { symbol: 'n₁, n₂', name: 'Principal Quantum Numbers', unit: 'dimensionless' }
    ]
  },
  {
    id: 'f-7',
    subjectId: 'chemistry',
    chapter: 'Chemical Changes',
    title: 'Arrhenius Equation for Rate Constant',
    latex: 'k = A e^{-\\frac{E_a}{RT}}',
    plain: 'k = A exp(-Ea / RT)',
    importance: 4,
    uses: 92,
    explanation: 'Expresses the temperature dependence of reaction rate constants.',
    variables: [
      { symbol: 'k', name: 'Rate Constant', unit: 's⁻¹ / M⁻¹s⁻¹' },
      { symbol: 'Ea', name: 'Activation Energy', unit: 'J/mol' },
      { symbol: 'R', name: 'Universal Gas Constant', unit: '8.314 J/(mol·K)' },
      { symbol: 'T', name: 'Absolute Temperature', unit: 'K' }
    ]
  },
  {
    id: 'f-8',
    subjectId: 'math',
    chapter: 'Calculus - Differentiation',
    title: 'Product Rule & Chain Rule',
    latex: '\\frac{d}{dx}[u \\cdot v] = u\\frac{dv}{dx} + v\\frac{du}{dx}',
    plain: 'd/dx(uv) = u(dv/dx) + v(du/dx)',
    importance: 5,
    uses: 230,
    explanation: 'Standard differentiation rule for multiplying two differentiable functions.',
    variables: [
      { symbol: 'u(x), v(x)', name: 'Differentiable Functions', unit: 'f(x)' }
    ]
  }
];

export const demoMCQs: MCQQuestion[] = [
  {
    id: 'mcq-1',
    subjectId: 'physics',
    chapter: 'Newtonian Mechanics',
    question: 'If the momentum of an object is increased by 50%, what is the percentage increase in its kinetic energy?',
    banglaQuestion: 'যদি একটি বস্তুর ভরবেগ ৫০% বৃদ্ধি পায়, তবে এর গতিশক্তি শতকরা কত বৃদ্ধি পাবে?',
    options: ['50%', '100%', '125%', '150%'],
    correctIndex: 2,
    explanation: 'Kinetic energy Ek = p²/(2m). If p becomes 1.5p, then Ek becomes (1.5)² = 2.25 times. Increase = (2.25 - 1) × 100% = 125%.',
    board: 'Dhaka Board',
    year: 2024,
    difficulty: 'medium'
  },
  {
    id: 'mcq-2',
    subjectId: 'physics',
    chapter: 'Vectors',
    question: 'Two forces of equal magnitude P act at an angle θ. If the magnitude of the resultant is also P, what is the value of θ?',
    banglaQuestion: 'সমান মানের দুটি বল P একটি কোণ θ-এ ক্রিয়াশীল। লব্ধির মানও যদি P হয়, তবে θ এর মান কত?',
    options: ['60°', '90°', '120°', '180°'],
    correctIndex: 2,
    explanation: 'R² = P² + P² + 2P² cos θ => P² = 2P²(1 + cos θ) => 1 = 2(1 + cos θ) => cos θ = -1/2 => θ = 120°.',
    board: 'Chittagong Board',
    year: 2023,
    difficulty: 'easy'
  },
  {
    id: 'mcq-3',
    subjectId: 'physics',
    chapter: 'Gravitation & Gravity',
    question: 'At what height above the Earth surface does the acceleration due to gravity become g/4 (where R is the Earth radius)?',
    banglaQuestion: 'পৃষ্ঠ হতে কত উচ্চতায় অভিকর্ষজ ত্বরণ g/4 হবে (যেখানে R পৃথিবীর ব্যাসার্ধ)?',
    options: ['R/2', 'R', '2R', '4R'],
    correctIndex: 1,
    explanation: "g' = g / (1 + h/R)². For g' = g/4, (1 + h/R)² = 4 => 1 + h/R = 2 => h = R.",
    board: 'Rajshahi Board',
    year: 2024,
    difficulty: 'medium'
  },
  {
    id: 'mcq-4',
    subjectId: 'chemistry',
    chapter: 'Qualitative Chemistry',
    question: 'Which quantum number determines the spatial orientation of an electron orbital?',
    banglaQuestion: 'কোন কোয়ান্টাম সংখ্যা ইলেকট্রন অরবিটালের ত্রিমাত্রিক দিকবিন্যাস নির্দেশ করে?',
    options: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (m)', 'Spin (s)'],
    correctIndex: 2,
    explanation: 'Principal (n) determines energy level and size; Azimuthal (l) determines orbital shape; Magnetic (m) determines spatial orientation.',
    board: 'Sylhet Board',
    year: 2023,
    difficulty: 'easy'
  },
  {
    id: 'mcq-5',
    subjectId: 'math',
    chapter: 'Calculus - Differentiation',
    question: 'What is the limit of (sin 3x) / (sin 5x) as x approaches 0?',
    banglaQuestion: 'x → 0 হলে lim (sin 3x) / (sin 5x) এর মান কত?',
    options: ['1', '3/5', '5/3', '0'],
    correctIndex: 1,
    explanation: 'lim (sin 3x / 3x) * (5x / sin 5x) * (3/5) = 1 * 1 * (3/5) = 3/5.',
    board: 'Dhaka Board',
    year: 2024,
    difficulty: 'easy'
  }
];

export const demoCQs: CQQuestion[] = [
  {
    id: 'cq-1',
    subjectId: 'physics',
    chapter: 'Newtonian Mechanics',
    title: 'Banking of Roads & Vehicle Stability',
    stimulus: 'A car of mass 1200 kg is negotiating a curved road of radius 150 m. The width of the road is 6 m and the outer edge is elevated by 0.5 m above the inner edge. On a rainy day, the coefficient of friction between tires and road drops to 0.15.',
    subQuestions: [
      {
        letter: 'a',
        banglaLetter: 'ক',
        question: 'What is inertia of motion (গতি জড়তা)?',
        marks: 1,
        solution: 'Inertia of motion is the inherent property of a moving body to maintain its state of uniform linear motion unless acted upon by an external unbalanced force.'
      },
      {
        letter: 'b',
        banglaLetter: 'খ',
        question: 'Why does a cricketer pull their hands backward while catching a fast ball?',
        marks: 2,
        solution: 'By pulling hands backward, the time interval (Δt) to bring momentum to zero increases. Since Impulse J = F × Δt = Δp, increasing time reduces the impacting force F on hands, preventing injury.'
      },
      {
        letter: 'c',
        banglaLetter: 'গ',
        question: 'Calculate the optimum banking angle (θ) and the safe speed without friction for this road curve.',
        marks: 3,
        solution: 'sin θ = h/d = 0.5/6 = 0.0833 => θ = sin⁻¹(0.0833) = 4.78°. Safe speed v = √(r · g · tan θ) = √(150 × 9.8 × tan 4.78°) = √(150 × 9.8 × 0.0836) = √122.9 = 11.08 m/s (approx 39.9 km/h).'
      },
      {
        letter: 'd',
        banglaLetter: 'ঘ',
        question: 'Mathematical analysis: Can the car safely negotiate the bend at 72 km/h on the rainy day? Justify.',
        marks: 4,
        solution: 'v = 72 km/h = 20 m/s. Maximum safe speed with friction on banked road: v_max = √[ r·g·(tan θ + μ) / (1 - μ·tan θ) ]. Here tan θ = 0.0836, μ = 0.15. Numerator = 150 × 9.8 × (0.0836 + 0.15) = 1470 × 0.2336 = 343.39. Denominator = 1 - (0.15 × 0.0836) = 0.9874. v_max = √(343.39 / 0.9874) = √347.77 = 18.65 m/s (67.14 km/h). Since 72 km/h (20 m/s) > 18.65 m/s, the car will skid off the road.'
      }
    ],
    board: 'Dhaka Board',
    year: 2024,
    difficulty: 'hard'
  },
  {
    id: 'cq-2',
    subjectId: 'physics',
    chapter: 'Vectors',
    title: 'River Swimmer & Boat Crossing',
    stimulus: 'A river of width 500 m flows with a current speed of 3 km/h. A boatman can row at a speed of 6 km/h in still water. Person A wants to reach the point directly opposite to the starting point, while Person B wants to cross the river in the shortest possible time.',
    subQuestions: [
      {
        letter: 'a',
        banglaLetter: 'ক',
        question: 'What is a unit vector (একক ভেক্টর)?',
        marks: 1,
        solution: 'A vector whose magnitude is exactly 1 unit and is used to specify direction is called a unit vector (â = A / |A|).'
      },
      {
        letter: 'b',
        banglaLetter: 'খ',
        question: 'Under what condition is the dot product of two non-zero vectors equal to zero?',
        marks: 2,
        solution: 'Since A · B = |A||B| cos θ, when θ = 90° (perpendicular vectors), cos 90° = 0, hence A · B = 0.'
      },
      {
        letter: 'c',
        banglaLetter: 'গ',
        question: 'Determine the angle and time taken by Person A to reach the point directly opposite.',
        marks: 3,
        solution: 'To cross directly opposite: cos α = -u/v = -3/6 = -0.5 => α = 120°. Effective velocity V = √(v² - u²) = √(36 - 9) = √27 = 5.196 km/h = 1.443 m/s. Time t = d / V = 500 m / 1.443 m/s = 346.4 seconds (approx 5.77 minutes).'
      },
      {
        letter: 'd',
        banglaLetter: 'ঘ',
        question: 'Compare the drift and time taken between Person A and Person B.',
        marks: 4,
        solution: 'For Person B (shortest time): Rows perpendicular to bank (α = 90°). Time t_min = d / v = 0.5 km / 6 km/h = 1/12 hour = 5 minutes (300 s). Downstream drift x = u × t_min = 3 km/h × (1/12 h) = 0.25 km = 250 m. Person B reaches faster by 46.4 seconds but drifts 250 m downstream, whereas Person A arrives without drift.'
      }
    ],
    board: 'Rajshahi Board',
    year: 2023,
    difficulty: 'medium'
  }
];
