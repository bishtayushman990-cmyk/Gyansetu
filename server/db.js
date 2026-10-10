import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'gyansetu_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Comprehensive Verified Question Bank across DSA, OS, CN, DBMS, OOP, Architecture, Security, Aptitude, Reasoning, Verbal, Communication
import { SEED_QUESTIONS } from './seedQuestions.js';

// Initial Seed Seeded Mistakes for the Demo User (using exact 'Needs Practice' / 'Improving' / 'Mastered' statuses)
const SEED_MISTAKES = [
  {
    id: "mistake-101",
    userId: "demo-user",
    questionId: "q-binary-search",
    questionTitle: "Binary Search",
    subject: "Data Structures and Algorithms",
    topic: "Binary Search and Sorting",
    difficulty: "Easy",
    attemptId: "att-101",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "Needs Practice",
    mistakeCategory: "boundary case",
    studentAnswer: "function search(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left < right) {\n        let mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
    correctAnswer: "while (left <= right) with mid = left + Math.floor((right - left) / 2)",
    lineHighlight: 3,
    relevantIncorrectSnippet: "while (left < right)",
    correctedSnippet: "while (left <= right)",
    failedTestCase: {
      input: { nums: [5], target: 5 },
      expectedOutput: 0,
      actualOutput: -1
    },
    evidence: "Used `while (left < right)` instead of `while (left <= right)`. Failed single-element test case `nums = [5], target = 5`.",
    explanation: "When `left < right`, the loop terminates prematurely when `left == right`, causing the search to miss the valid target if it is situated exactly at that remaining index.",
    recommendedCorrection: "Change the loop termination to `while (left <= right)` to include the single element search interval [left, right].",
    conceptToRevise: "Binary Search boundary conditions and interval closures [left, right] vs [left, right)",
    retryCount: 0,
    hintLevelsUsed: [1, 2],
    history: [
      {
        attemptDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        outcome: "Failed test case 3: nums=[5], target=5",
        status: "Needs Practice"
      }
    ]
  },
  {
    id: "mistake-102",
    userId: "demo-user",
    questionId: "q-valid-parentheses",
    questionTitle: "Valid Parentheses",
    subject: "Data Structures and Algorithms",
    topic: "Stacks & Queues",
    difficulty: "Easy",
    attemptId: "att-102",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: "Improving",
    mistakeCategory: "boundary case",
    studentAnswer: "function isValid(s) {\n    let stack = [];\n    // ... pops matching brackets\n    return true;\n}",
    correctAnswer: "return stack.length === 0;",
    lineHighlight: 12,
    relevantIncorrectSnippet: "return true;",
    correctedSnippet: "return stack.length === 0;",
    failedTestCase: {
      input: { s: "[" },
      expectedOutput: false,
      actualOutput: true
    },
    evidence: "Returned `true` for input `s = '['`. Forgot to check if the stack was completely empty upon loop completion.",
    explanation: "If opening brackets remain in the stack after all characters have been processed, the parentheses are unmatched. Returning `true` without `stack.length === 0` misses unclosed brackets.",
    recommendedCorrection: "Always return `stack.length === 0` so unclosed opening brackets trigger a false evaluation.",
    conceptToRevise: "Stack invariant validation: Always verify `stack.empty()` before declaring balanced sequence.",
    retryCount: 1,
    hintLevelsUsed: [1, 2, 3],
    history: [
      {
        attemptDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        outcome: "Failed on input '['",
        status: "Needs Practice"
      },
      {
        attemptDate: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        outcome: "Passed 4 / 5 test cases on retry",
        status: "Improving"
      }
    ]
  }
];

// Initial Seed Users
const SEED_USERS = [
  {
    id: "demo-user",
    username: "ayushman",
    email: "demo@gyansetu.edu",
    displayName: "Ayushman Bisht",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ayushman",
    college: "Institute of Technology",
    educationLevel: "B.Tech Final Year (CSE)",
    target: "SDE-1 / Product Companies (Campus Placement 2026)",
    preferredLanguage: "javascript",
    skillLevel: "Intermediate",
    availableStudyTime: "2-3 hours / day",
    interests: ["Data Structures and Algorithms", "DBMS and SQL", "Operating Systems", "Communication and Interviews"],
    streak: 7,
    xp: 1700,
    level: 4,
    dailyGoal: 3,
    dailySolvedToday: 2,
    createdAt: new Date().toISOString(),
    isDemo: true
  }
];

// Seed Study Tasks
const SEED_STUDY_TASKS = [
  {
    id: "task-1",
    userId: "demo-user",
    title: "Revise Binary Search Boundary Invariant",
    type: "mistake-revision",
    priority: "High",
    durationMinutes: 25,
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    relatedQuestionId: "q-binary-search",
    sourceMistakeId: "mistake-101"
  },
  {
    id: "task-2",
    userId: "demo-user",
    title: "Solve Two Sum with O(N) Hash Map",
    type: "practice",
    priority: "High",
    durationMinutes: 30,
    dueDate: new Date().toISOString().split('T')[0],
    completed: true,
    relatedQuestionId: "q-two-sum"
  },
  {
    id: "task-comm-1",
    userId: "demo-user",
    title: "Communication Gym: Practice 90s Project Architecture Walkthrough",
    type: "communication",
    priority: "High",
    durationMinutes: 20,
    dueDate: new Date().toISOString().split('T')[0],
    completed: false
  }
];

// Communication Gym Seed Challenges & Prompts
const SEED_COMMUNICATION_CHALLENGES = [
  {
    id: "comm-ch-1",
    title: "Explain What Happens When You Type a URL in a Browser",
    category: "Technical Speaking",
    timeLimitSeconds: 90,
    targetAudience: "Technical Recruiter & Senior Engineer",
    question: "In 90 seconds, explain the complete sequence of events when a user types a URL (e.g. https://gyansetu.edu) into their browser and presses Enter.",
    sampleOpening: "When a user types a URL into a browser, the journey can be broken down into DNS resolution, TCP/TLS handshake, HTTP request dispatch, and DOM rendering.",
    frameworkHint: "Structure: 1. DNS Lookup -> 2. TCP 3-Way Handshake & TLS -> 3. HTTP Request & Server Processing -> 4. Browser Rendering (DOM, CSSOM).",
    freezeRescue: [
      { level: 1, title: "Gentle Starting Prompt", content: "Start with the domain name: what translates 'gyansetu.edu' into an IP address?" },
      { level: 2, title: "Sample Opening Sentence", content: "\"The first step in this request lifecycle is resolving the domain name into an IP address via DNS lookup.\"" },
      { level: 3, title: "Answer Structure", content: "Mention: 1. DNS -> 2. TCP/TLS connection -> 3. Server HTTP response -> 4. Browser rendering." },
      { level: 4, title: "Relevant Clue / Example", content: "Remember the 3-way handshake: SYN, SYN-ACK, ACK, followed by TLS key exchange." },
      { level: 5, title: "Complete Model Answer", content: "When a URL is entered, the browser first checks its local cache and queries DNS resolvers to translate the hostname into an IP address. Next, it establishes a reliable connection using the TCP 3-way handshake and negotiates encryption via TLS. The client then transmits an HTTP GET request to the web server. The server processes business logic, queries the database, and returns an HTTP response with HTML/CSS/JS assets, which the browser engine parses into the DOM and renders on screen." }
    ]
  },
  {
    id: "comm-ch-2",
    title: "Explain HashMap O(1) Lookup and How Collisions Are Handled",
    category: "Technical Speaking",
    timeLimitSeconds: 90,
    targetAudience: "SDE Technical Interviewer",
    question: "Why do Hash Maps provide average O(1) time complexity, and how do they resolve hash collisions?",
    sampleOpening: "A Hash Map achieves average constant time complexity by using a hash function to map keys directly to array bucket indices.",
    frameworkHint: "Structure: 1. Core concept (hash function + array index) -> 2. Collision resolution (Separate Chaining vs Open Addressing) -> 3. Worst-case scenario (O(N) degraded tree).",
    freezeRescue: [
      { level: 1, title: "Gentle Starting Prompt", content: "Think about arrays: array lookup by index is always O(1). How does a hash map turn a key into an index?" },
      { level: 2, title: "Sample Opening Sentence", content: "\"Hash maps achieve O(1) average time because the hash function converts any key into an integer array index in constant time.\"" },
      { level: 3, title: "Answer Structure", content: "Explain: 1. Key hashing -> 2. Bucket indexing -> 3. Separate chaining (linked list / red-black tree) -> 4. Load factor re-hashing." },
      { level: 4, title: "Relevant Clue / Example", content: "In Java 8, when a bucket exceeds 8 nodes, linked list converts to a balanced red-black tree to ensure O(log N) worst case." },
      { level: 5, title: "Complete Model Answer", content: "A Hash Map works by applying a hash function to a key, producing a hash code that is modulo-indexed into an underlying array. In the ideal case with a uniform hash distribution, this gives instant O(1) array access. When two distinct keys produce the same bucket index—known as a collision—modern hash maps resolve this using Separate Chaining. In Java 8+, if a bucket's linked list grows past 8 elements, it automatically converts to a Red-Black Tree, guaranteeing O(log N) lookup even during adversarial collision attacks." }
    ]
  },
  {
    id: "comm-ch-3",
    title: "Tell Me About a Difficult Bug You Debugged Under Pressure (STAR)",
    category: "HR & Behavioral",
    timeLimitSeconds: 120,
    targetAudience: "Hiring Manager",
    question: "Describe a challenging technical bug or outage you resolved under pressure in a project. Use the STAR framework.",
    sampleOpening: "During the final testing phase of our distributed queue project, we encountered a sporadic data corruption bug right before our submission deadline.",
    frameworkHint: "STAR Format: Situation (deadline & bug impact) -> Task (isolate root cause) -> Action (logging, concurrency locks, reproduction script) -> Result (resolution, 0% errors, lessons learned).",
    freezeRescue: [
      { level: 1, title: "Gentle Starting Prompt", content: "Start with the context: what project was it, and what unexpected behavior happened?" },
      { level: 2, title: "Sample Opening Sentence", content: "\"During the deployment of our semester project, we noticed that concurrent requests were intermittently causing duplicate transactions.\"" },
      { level: 3, title: "Answer Structure", content: "Follow STAR: 1. Situation (context) -> 2. Task (your goal) -> 3. Action (how you debugged) -> 4. Result (measurable outcome)." },
      { level: 4, title: "Relevant Clue / Example", content: "Focus on YOUR actions: profiling tools, unit test reproduction, implementing idempotency." },
      { level: 5, title: "Complete Model Answer", content: "Situation: 48 hours before our campus project demo, our backend was randomly dropping background job payloads under high concurrency. Task: I was responsible for isolating whether the failure originated in the Redis message broker or our worker database pool. Action: I wrote a scripted stress-test with 5,000 simulated requests and enabled detailed execution tracing. I discovered a race condition where workers acknowledged messages before committing the transaction. I restructured the worker logic with atomic acknowledgment and idempotency keys. Result: The bug was completely eliminated with zero dropped jobs under 10x traffic, and we presented a flawless demo." }
    ]
  }
];

export const SEED_TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Gaurav",
    role: "B.Tech CSE, Final Year",
    college: "Institute of Technology",
    photoUrl: "/testimonials/ayushman.jpg",
    topicTag: "Recall Arena & DSA",
    feedback: "The Recall Arena completely transformed how I revise. Instead of passively re-reading solutions, being retested under a strict timer without hints forced me to master my edge-case boundaries in Kadane's and Graph BFS.",
    consent: true,
    createdAt: "2026-09-15T10:30:00.000Z"
  },
  {
    id: "testimonial-2",
    name: "Angel",
    role: "B.Tech ECE, 3rd Year",
    college: "IIT Bombay",
    photoUrl: "/testimonials/sneha.jpg",
    topicTag: "Project Defense & System Design",
    feedback: "Project Defense Lab asked me tough architectural questions about idempotency and concurrency in my distributed queue project. When campus interviewers drilled down into my repo, I was already prepared with STAR-structured answers.",
    consent: true,
    createdAt: "2026-09-28T14:15:00.000Z"
  }
];

class Database {
  constructor() {
    this.data = {
      users: SEED_USERS,
      questions: SEED_QUESTIONS,
      attempts: [],
      mistakes: SEED_MISTAKES,
      testimonials: SEED_TESTIMONIALS,
      bookmarks: [{ userId: "demo-user", questionId: "q-two-sum", createdAt: new Date().toISOString() }],
      recallSessions: [],
      studyTasks: SEED_STUDY_TASKS,
      communicationChallenges: SEED_COMMUNICATION_CHALLENGES,
      communicationMemory: [
        {
          id: "comm-mem-1",
          userId: "demo-user",
          weaknessType: "Omission of Concrete Examples",
          evidence: "Answer on TCP handshake explained theory well but omitted practical metrics or real-world packet flow example.",
          recommendedExercise: "Practice with STAR framework and include exact numerical metrics (e.g. latency, throughput).",
          status: "Improving",
          recordedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
        }
      ],
      communicationHistory: [],
      projects: [
        {
          id: "proj-1",
          userId: "demo-user",
          title: "Distributed Task Scheduler & Queue",
          description: "High-throughput asynchronous background job processor with worker pools and retry policies in Node.js & Redis.",
          techStack: "Node.js, Redis, PostgreSQL, Docker, BullMQ",
          architecture: "Master-worker pattern with Redis Streams queue and persistent PostgreSQL audit log.",
          challenges: "Handling worker node crash mid-execution without dropping jobs or double-processing idempotency.",
          contributions: "Designed the dead-letter queue recovery mechanism and heartbeat health monitoring.",
          repoUrl: "https://github.com/bishtayushman990-cmyk/Gyansetu",
          interviewSessions: []
        }
      ],
      aiConversations: {},
      arena: {
        dailyChallengeId: "q-two-sum",
        dailyChallengeDate: new Date().toISOString().split('T')[0],
        leaderboard: [
          { rank: 1, name: "Sneha Patel", college: "IIT Bombay", xp: 3420, streak: 21, solved: 142 },
          { rank: 2, name: "Rohan Verma", college: "NIT Trichy", xp: 2980, streak: 14, solved: 118 },
          { rank: 3, name: "Ayushman Bisht", college: "Institute of Tech", xp: 1700, streak: 7, solved: 48, isCurrentUser: true },
          { rank: 4, name: "Ananya Iyer", college: "BITS Pilani", xp: 1320, streak: 6, solved: 42 },
          { rank: 5, name: "Karthik Raja", college: "IIIT Hyderabad", xp: 1190, streak: 5, solved: 39 }
        ]
      },
      notifications: [
        {
          id: "notif-1",
          userId: "demo-user",
          title: "Revision Ready in Mistake Memory",
          message: "You have 1 pending revision for Binary Search boundary invariants.",
          type: "revision",
          read: false,
          link: "/mistakes",
          createdAt: new Date().toISOString()
        }
      ]
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };
        // Ensure comprehensive question bank is preserved
        if (!this.data.questions || this.data.questions.length < SEED_QUESTIONS.length) {
          this.data.questions = SEED_QUESTIONS;
        }
        if (!this.data.recallSessions) {
          this.data.recallSessions = [];
        }
        // Merge all seed questions so bank is always up-to-date
        const existingIds = new Set((this.data.questions || []).map(q => q.id));
        for (const seedQ of SEED_QUESTIONS) {
          if (!existingIds.has(seedQ.id)) {
            this.data.questions.push(seedQ);
          }
        }
        if (!this.data.communicationChallenges) {
          this.data.communicationChallenges = SEED_COMMUNICATION_CHALLENGES;
        }
        if (!this.data.testimonials || !Array.isArray(this.data.testimonials) || this.data.testimonials.length === 0) {
          this.data.testimonials = SEED_TESTIMONIALS;
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error("[Database] Error loading db file, initializing seed data:", err);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("[Database] Error saving db:", err);
    }
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Questions
  getQuestions() { return this.data.questions; }
  getQuestionById(id) { return this.data.questions.find(q => q.id === id || q.slug === id); }

  // Attempts
  getAttempts(userId) {
    if (!userId) return this.data.attempts;
    return this.data.attempts.filter(a => a.userId === userId);
  }
  createAttempt(attempt) {
    this.data.attempts.unshift(attempt);
    this.save();
    return attempt;
  }

  // Mistakes (Mistake Memory)
  getMistakes(userId) {
    if (!userId) return this.data.mistakes;
    return this.data.mistakes.filter(m => m.userId === userId);
  }
  getMistakeById(id) {
    return this.data.mistakes.find(m => m.id === id);
  }
  createMistake(mistake) {
    this.data.mistakes.unshift(mistake);
    this.save();
    return mistake;
  }
  updateMistake(id, updates) {
    const idx = this.data.mistakes.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.mistakes[idx] = { ...this.data.mistakes[idx], ...updates };
      this.save();
      return this.data.mistakes[idx];
    }
    return null;
  }
  deleteMistake(id) {
    this.data.mistakes = this.data.mistakes.filter(m => m.id !== id);
    this.save();
    return true;
  }

  // Communication Gym
  getCommunicationChallenges() {
    return this.data.communicationChallenges || SEED_COMMUNICATION_CHALLENGES;
  }
  getCommunicationMemory(userId) {
    if (!this.data.communicationMemory) this.data.communicationMemory = [];
    return this.data.communicationMemory.filter(c => c.userId === userId);
  }
  createCommunicationMemory(item) {
    if (!this.data.communicationMemory) this.data.communicationMemory = [];
    this.data.communicationMemory.unshift(item);
    this.save();
    return item;
  }
  deleteCommunicationMemory(id) {
    if (!this.data.communicationMemory) this.data.communicationMemory = [];
    this.data.communicationMemory = this.data.communicationMemory.filter(c => c.id !== id);
    this.save();
    return true;
  }
  getCommunicationHistory(userId) {
    if (!this.data.communicationHistory) this.data.communicationHistory = [];
    return this.data.communicationHistory.filter(h => h.userId === userId);
  }
  recordCommunicationAttempt(attempt) {
    if (!this.data.communicationHistory) this.data.communicationHistory = [];
    this.data.communicationHistory.unshift(attempt);
    this.save();
    return attempt;
  }

  // Bookmarks
  getBookmarks(userId) {
    return this.data.bookmarks.filter(b => b.userId === userId);
  }
  toggleBookmark(userId, questionId) {
    const idx = this.data.bookmarks.findIndex(b => b.userId === userId && b.questionId === questionId);
    let bookmarked = false;
    if (idx !== -1) {
      this.data.bookmarks.splice(idx, 1);
    } else {
      this.data.bookmarks.push({ userId, questionId, createdAt: new Date().toISOString() });
      bookmarked = true;
    }
    this.save();
    return bookmarked;
  }

  // Study Planner
  getStudyTasks(userId) {
    return this.data.studyTasks.filter(t => t.userId === userId);
  }
  createStudyTask(task) {
    this.data.studyTasks.push(task);
    this.save();
    return task;
  }
  updateStudyTask(id, updates) {
    const idx = this.data.studyTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.studyTasks[idx] = { ...this.data.studyTasks[idx], ...updates };
      this.save();
      return this.data.studyTasks[idx];
    }
    return null;
  }
  deleteStudyTask(id) {
    this.data.studyTasks = this.data.studyTasks.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // Projects
  getProjects(userId) {
    return this.data.projects.filter(p => p.userId === userId);
  }
  createProject(project) {
    this.data.projects.unshift(project);
    this.save();
    return project;
  }
  updateProject(id, updates) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
      this.save();
      return this.data.projects[idx];
    }
    return null;
  }

  // Arena & Notifications
  getArena() { return this.data.arena; }
  getNotifications(userId) {
    return this.data.notifications.filter(n => n.userId === userId);
  }
  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  // Recall Arena Sessions
  getRecallSessions(userId) {
    if (!this.data.recallSessions) this.data.recallSessions = [];
    if (!userId) return this.data.recallSessions;
    return this.data.recallSessions.filter(s => s.userId === userId);
  }
  getRecallSessionById(id) {
    if (!this.data.recallSessions) this.data.recallSessions = [];
    return this.data.recallSessions.find(s => s.id === id);
  }
  getActiveRecallSession(userId) {
    if (!this.data.recallSessions) this.data.recallSessions = [];
    return this.data.recallSessions.find(s => s.userId === userId && s.status === 'in_progress');
  }
  createRecallSession(session) {
    if (!this.data.recallSessions) this.data.recallSessions = [];
    this.data.recallSessions.unshift(session);
    this.save();
    return session;
  }
  updateRecallSession(id, updates) {
    if (!this.data.recallSessions) this.data.recallSessions = [];
    const idx = this.data.recallSessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.recallSessions[idx] = { ...this.data.recallSessions[idx], ...updates };
      this.save();
      return this.data.recallSessions[idx];
    }
    return null;
  }

  // Skill Tree
  getSkillTree() {
    return this.data.skillTree || [];
  }

  // Student Testimonials
  getTestimonials() {
    if (!this.data.testimonials || !Array.isArray(this.data.testimonials)) {
      this.data.testimonials = [...SEED_TESTIMONIALS];
    }
    return this.data.testimonials.filter(t => t.consent === true);
  }

  createTestimonial(testimonial) {
    if (!this.data.testimonials || !Array.isArray(this.data.testimonials)) {
      this.data.testimonials = [];
    }
    const newTestimonial = {
      id: `testimonial-${Date.now()}`,
      name: (testimonial.name || "Anonymous Student").trim(),
      role: (testimonial.role || "B.Tech Student").trim(),
      college: (testimonial.college || "").trim(),
      photoUrl: (testimonial.photoUrl || "").trim(),
      topicTag: (testimonial.topicTag || "General Feedback").trim(),
      feedback: (testimonial.feedback || "").trim(),
      consent: testimonial.consent === true || testimonial.consent === 'true',
      createdAt: new Date().toISOString()
    };
    this.data.testimonials.unshift(newTestimonial);
    this.save();
    return newTestimonial;
  }
}

export const db = new Database();


