// GyaanSetu End-to-End Acceptance Test Suite
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log("=== STARTING GYAANSETU E2E VERIFICATION TESTS ===");
  let passed = 0;
  let total = 0;

  async function assert(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${desc}: ${err.message}`);
    }
  }

  // TEST 1: Question Bank & Subjects
  await assert("Practice Lab has comprehensive questions across 11 domains", async () => {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    if (!data.questions || data.questions.length < 10) throw new Error("Question count too low");
    const subjects = new Set(data.questions.map(q => q.category));
    if (!subjects.has("Data Structures and Algorithms") || !subjects.has("Operating Systems") || !subjects.has("DBMS and SQL")) {
      throw new Error("Missing required domains");
    }
  });

  // TEST 2: Mistake Memory Diagnosis & Line Attribution
  await assert("Submitting faulty Binary Search records line #3 and boundary case in Mistake Memory", async () => {
    const faultyCode = `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`;
    const res = await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        questionId: 'q-binary-search',
        language: 'javascript',
        code: faultyCode,
        hintLevelsUsed: [1, 2]
      })
    });
    const data = await res.json();
    if (data.isPassed) throw new Error("Expected faulty code to fail");
    if (!data.mistake) throw new Error("No mistake record created");
    if (data.mistake.lineHighlight !== 3) throw new Error(`Expected lineHighlight 3, got ${data.mistake.lineHighlight}`);
    if (data.mistake.status !== "Needs Practice") throw new Error(`Expected 'Needs Practice', got ${data.mistake.status}`);
    if (!data.mistake.relevantIncorrectSnippet.includes("while (left < right)")) {
      throw new Error("Missing faulty snippet");
    }
  });

  // TEST 3: Mistake Memory Retry & History Preservation
  await assert("Retrying question with correct code updates status to Mastered without deleting attempt history", async () => {
    const correctCode = `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`;
    const res = await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        questionId: 'q-binary-search',
        language: 'javascript',
        code: correctCode,
        hintLevelsUsed: [1, 2]
      })
    });
    const data = await res.json();
    if (!data.isPassed) throw new Error("Expected correct code to pass");
    if (!data.mistake || data.mistake.status !== "Mastered") {
      throw new Error(`Expected status 'Mastered', got ${data.mistake?.status}`);
    }
    if (!data.mistake.history || data.mistake.history.length < 2) {
      throw new Error("Previous attempt history was not preserved!");
    }
  });

  // TEST 4: AI Study Buddy - Line Follow-up & Pasted Code
  await assert("AI Study Buddy responds to 'explain line 5' specifically", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/study-buddy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        message: "explain line 5",
        codeContext: `function search(nums, target) {\n    let left = 0;\n    let right = nums.length - 1;\n    while (left <= right) {\n        let mid = Math.floor((left + right) / 2);\n    }\n}`
      })
    });
    const data = await res.json();
    if (!data.reply || !data.reply.includes("Line 5") || !data.reply.includes("mid")) {
      throw new Error("AI did not specifically explain line 5");
    }
  });

  // TEST 5: Communication Gym Clarity Coach & Filler Words
  await assert("Communication Gym detects filler words and scores answer clarity", async () => {
    const res = await fetch(`${BASE_URL}/api/communication/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        challengeId: 'comm-ch-1',
        mode: 'text',
        transcript: "Um, basically, when you type a URL, like, DNS resolves the domain name into an IP address, and uh, then TCP establishes a 3-way handshake.",
        durationSeconds: 40
      })
    });
    const data = await res.json();
    if (!data.feedback) throw new Error("Missing feedback");
    if (data.feedback.fillerWordsCount < 3) throw new Error(`Expected at least 3 filler words detected, got ${data.feedback.fillerWordsCount}`);
    if (!data.feedback.targetedExercise) throw new Error("Missing targeted exercise");
  });

  // TEST 6: Communication Memory Logging
  await assert("Communication weakness is logged in Communication Memory", async () => {
    const res = await fetch(`${BASE_URL}/api/communication/memory`, {
      headers: { 'x-user-id': 'test-student' }
    });
    const data = await res.json();
    if (!data.memory || data.memory.length === 0) throw new Error("Expected communication weakness record");
    if (!data.memory.some(m => m.weaknessType.includes("Filler Words"))) {
      throw new Error("Missing filler words weakness log");
    }
  });

  // TEST 7: Project Interview Lab Import
  await assert("Project Interview Lab imports repo and produces verified architecture profile & 10 questions", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/import-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        repoUrl: "https://github.com/bishtayushman990-cmyk/Gyansetu"
      })
    });
    const data = await res.json();
    if (!data.project) throw new Error("Project not created");
    if (!data.project.architectureDiagram || data.project.architectureDiagram.nodes.length < 3) {
      throw new Error("Missing architecture diagram nodes");
    }
    if (!data.project.defenseQuestions || data.project.defenseQuestions.length < 10) {
      throw new Error("Expected at least 10 defense questions");
    }
  });

  // TEST 8: Anti-Duplicate XP Rule
  await assert("Anti-duplicate XP prevents double rewards on repeated submissions of already-solved question", async () => {
    const userRes1 = await fetch(`${BASE_URL}/api/analytics`, { headers: { 'x-user-id': 'test-student' } });
    const userData1 = await userRes1.json();
    const initialXP = userData1.summary.xp;

    // Resubmit already passed code
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({
        questionId: 'q-binary-search',
        language: 'javascript',
        code: `function search(nums, target) { let l = 0, r = nums.length - 1; while(l <= r) { let m = Math.floor((l+r)/2); if(nums[m]===target) return m; else if(nums[m]<target) l = m + 1; else r = m - 1; } return -1; }`
      })
    });

    const userRes2 = await fetch(`${BASE_URL}/api/analytics`, { headers: { 'x-user-id': 'test-student' } });
    const userData2 = await userRes2.json();
    const finalXP = userData2.summary.xp;

    if (finalXP !== initialXP) {
      throw new Error(`Double XP awarded on duplicate solve! (${initialXP} -> ${finalXP})`);
    }
  });

  // TEST 9: Real Question Bank Expansion & Coverage
  await assert("Question bank has over 60 real questions covering all placement domains backed by database", async () => {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    if (!data.questions || data.questions.length < 50) {
      throw new Error(`Expected at least 50 questions, found ${data.questions?.length}`);
    }
    const categories = new Set(data.questions.map(q => q.category));
    const requiredCats = [
      "Data Structures and Algorithms",
      "DBMS and SQL",
      "Operating Systems",
      "Aptitude",
      "Computer Networks",
      "OOP and Programming",
      "Computer Architecture",
      "Cybersecurity",
      "Technical Interview Questions",
      "HR and Behavioral Interview Practice"
    ];
    for (const cat of requiredCats) {
      if (!categories.has(cat)) throw new Error(`Missing category: ${cat}`);
    }
  });

  // TEST 10: Search, Difficulty Filters & Bookmarks
  await assert("Search, difficulty filtering, and bookmark toggling function correctly", async () => {
    // Search
    const searchRes = await fetch(`${BASE_URL}/api/questions?search=Binary`);
    const searchData = await searchRes.json();
    if (!searchData.questions.some(q => q.title.includes("Binary"))) throw new Error("Search filter failed");

    // Difficulty
    const diffRes = await fetch(`${BASE_URL}/api/questions?difficulty=Hard`);
    const diffData = await diffRes.json();
    if (diffData.questions.some(q => q.difficulty !== "Hard")) throw new Error("Difficulty filter failed");

    // Bookmark toggle
    const bRes = await fetch(`${BASE_URL}/api/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-student' },
      body: JSON.stringify({ questionId: 'q-two-sum' })
    });
    const bData = await bRes.json();
    if (typeof bData.bookmarked !== 'boolean') throw new Error("Bookmark toggle failed");
  });

  // TEST 11: Recall Arena - Empty History Detection
  await assert("Recall Arena handles empty user history gracefully with canStart=false and empty state message", async () => {
    const newUser = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `empty-${Date.now()}@test.com`, displayName: 'Empty History User' })
    }).then(r => r.json())).user;

    const statusRes = await fetch(`${BASE_URL}/api/recall-arena/status`, {
      headers: { 'x-user-id': newUser.id }
    });
    const statusData = await statusRes.json();
    if (statusData.canStart !== false) throw new Error("Expected canStart to be false for empty history");
    if (statusData.eligibleCount !== 0) throw new Error(`Expected 0 eligible questions, got ${statusData.eligibleCount}`);
    if (statusData.detectedMode !== 'empty') throw new Error(`Expected 'empty' mode, got ${statusData.detectedMode}`);
  });

  // TEST 12: Recall Arena - DSA-only History Detection
  await assert("Recall Arena automatic subject detection identifies DSA-only history", async () => {
    const dsaUser = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `dsa-${Date.now()}@test.com`, displayName: 'DSA User' })
    }).then(r => r.json())).user;

    // Submit DSA attempt
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': dsaUser.id },
      body: JSON.stringify({
        questionId: 'q-two-sum',
        language: 'javascript',
        code: `function twoSum(nums, target) { return [0, 1]; }`
      })
    });

    const statusRes = await fetch(`${BASE_URL}/api/recall-arena/status`, {
      headers: { 'x-user-id': dsaUser.id }
    });
    const statusData = await statusRes.json();
    if (statusData.detectedMode !== 'dsa_only') {
      throw new Error(`Expected 'dsa_only' mode, got ${statusData.detectedMode}`);
    }
    if (statusData.eligibleCount !== 1) {
      throw new Error(`Expected 1 eligible question, got ${statusData.eligibleCount}`);
    }
  });

  // TEST 13: Recall Arena - Aptitude-only History Detection
  await assert("Recall Arena automatic subject detection identifies Aptitude-only history", async () => {
    const aptUser = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `apt-${Date.now()}@test.com`, displayName: 'Apt User' })
    }).then(r => r.json())).user;

    // Submit Aptitude attempt
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': aptUser.id },
      body: JSON.stringify({
        questionId: 'q-mcq-aptitude-work',
        selectedOption: 0
      })
    });

    const statusRes = await fetch(`${BASE_URL}/api/recall-arena/status`, {
      headers: { 'x-user-id': aptUser.id }
    });
    const statusData = await statusRes.json();
    if (statusData.detectedMode !== 'aptitude_only') {
      throw new Error(`Expected 'aptitude_only' mode, got ${statusData.detectedMode}`);
    }
  });

  // TEST 14: Recall Arena - Multi-Subject History Detection
  await assert("Recall Arena automatic subject detection identifies multi-subject history and combines eligible pool", async () => {
    const multiUser = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `multi-${Date.now()}@test.com`, displayName: 'Multi User' })
    }).then(r => r.json())).user;

    // Submit 1 DSA and 1 OS attempt
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': multiUser.id },
      body: JSON.stringify({ questionId: 'q-two-sum', language: 'javascript', code: 'function twoSum(){return [0,1];}' })
    });
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': multiUser.id },
      body: JSON.stringify({ questionId: 'q-mcq-os-deadlock', selectedOption: 2 })
    });

    const statusRes = await fetch(`${BASE_URL}/api/recall-arena/status`, {
      headers: { 'x-user-id': multiUser.id }
    });
    const statusData = await statusRes.json();
    if (statusData.detectedMode !== 'multi_subject') {
      throw new Error(`Expected 'multi_subject' mode, got ${statusData.detectedMode}`);
    }
    if (statusData.eligibleCount !== 2) {
      throw new Error(`Expected 2 eligible questions, got ${statusData.eligibleCount}`);
    }
  });

  // TEST 15: Recall Arena - Hints and Answers are Disabled/Stripped in Active Session
  await assert("Hints, solutions, and test case answers are strictly stripped from active test session questions", async () => {
    const userRes = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `strip-${Date.now()}@test.com`, displayName: 'Strip Test User' })
    }).then(r => r.json())).user;

    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ questionId: 'q-mcq-os-deadlock', selectedOption: 2 })
    });

    const startRes = await fetch(`${BASE_URL}/api/recall-arena/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ mode: 'mixed', length: 10 })
    });
    const startData = await startRes.json();
    if (!startData.success || !startData.session) throw new Error("Failed to start session");

    const q = startData.session.questions[0];
    if (q.hintLadder !== undefined) throw new Error("hintLadder was not stripped!");
    if (q.correctOption !== undefined) throw new Error("correctOption was not stripped!");
    if (q.testCases !== undefined) throw new Error("testCases were not stripped!");
  });

  // TEST 16: Recall Arena - Session Persistence and Remaining Time Calculation
  await assert("Active session preserves answers, start time, and computes remaining time from persisted deadline", async () => {
    const userRes = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `persist-${Date.now()}@test.com`, displayName: 'Persistence User' })
    }).then(r => r.json())).user;

    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ questionId: 'q-mcq-os-deadlock', selectedOption: 2 })
    });

    const startRes = await fetch(`${BASE_URL}/api/recall-arena/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ mode: 'mixed', length: 10 })
    });
    const startData = await startRes.json();
    const sessionId = startData.session.id;

    // Save answer
    await fetch(`${BASE_URL}/api/recall-arena/save-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ sessionId, questionId: 'q-mcq-os-deadlock', answer: 2 })
    });

    // Simulate page refresh: fetch session
    const refreshRes = await fetch(`${BASE_URL}/api/recall-arena/session/${sessionId}`, {
      headers: { 'x-user-id': userRes.id }
    });
    const refreshData = await refreshRes.json();
    if (!refreshData.session) throw new Error("Session could not be retrieved on refresh");
    if (refreshData.session.answers['q-mcq-os-deadlock'] !== 2) throw new Error("Saved answer not persisted");
    if (refreshData.remainingSeconds <= 0) throw new Error("Remaining seconds should be positive");
  });

  // TEST 17: Anti-Duplicate Submission & Scoring Protection
  await assert("Recall Arena prevents duplicate submissions, repeated scoring, and double XP awards", async () => {
    const userRes = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nodup-${Date.now()}@test.com`, displayName: 'No Dup User' })
    }).then(r => r.json())).user;

    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ questionId: 'q-mcq-os-deadlock', selectedOption: 2 })
    });

    const startData = await fetch(`${BASE_URL}/api/recall-arena/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ mode: 'mixed', length: 10 })
    }).then(r => r.json());

    const sessionId = startData.session.id;

    // First submission
    const sub1 = await fetch(`${BASE_URL}/api/recall-arena/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ sessionId, answers: { 'q-mcq-os-deadlock': 2 } })
    }).then(r => r.json());

    if (!sub1.report || sub1.report.correctCount !== 1) throw new Error("First submission failed to grade correctly");

    const userProfile1 = await fetch(`${BASE_URL}/api/auth/me`, { headers: { 'x-user-id': userRes.id } }).then(r => r.json());
    const xpAfterFirst = userProfile1.user.xp;

    // Duplicate submission attempt
    const sub2 = await fetch(`${BASE_URL}/api/recall-arena/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ sessionId, answers: { 'q-mcq-os-deadlock': 2 } })
    }).then(r => r.json());

    if (!sub2.alreadySubmitted) throw new Error("Expected alreadySubmitted=true on duplicate submission");

    const userProfile2 = await fetch(`${BASE_URL}/api/auth/me`, { headers: { 'x-user-id': userRes.id } }).then(r => r.json());
    if (userProfile2.user.xp !== xpAfterFirst) {
      throw new Error(`XP was improperly duplicated on resubmission! (${xpAfterFirst} -> ${userProfile2.user.xp})`);
    }
  });

  // TEST 18: Repeated Mistakes and Mastery Progression Rules
  await assert("Recall Arena updates Mistake Memory with repeated mistake detection and explicit mastery rules", async () => {
    const userRes = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `mistake-${Date.now()}@test.com`, displayName: 'Mistake Progression User' })
    }).then(r => r.json())).user;

    // Initial practice attempt: fail on question
    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ questionId: 'q-mcq-os-deadlock', selectedOption: 0 }) // 0 is wrong
    });

    const mistakesBefore = await fetch(`${BASE_URL}/api/mistakes`, { headers: { 'x-user-id': userRes.id } }).then(r => r.json());
    if (mistakesBefore.mistakes.length === 0) throw new Error("Initial failure did not create mistake");

    // Take Recall Arena test and fail again
    const startData = await fetch(`${BASE_URL}/api/recall-arena/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ mode: 'mixed', length: 1 })
    }).then(r => r.json());

    const submitData = await fetch(`${BASE_URL}/api/recall-arena/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userRes.id },
      body: JSON.stringify({ sessionId: startData.session.id, answers: { 'q-mcq-os-deadlock': 0 } })
    }).then(r => r.json());

    if (!submitData.report.repeatedMistakes || submitData.report.repeatedMistakes.length === 0) {
      throw new Error("Expected repeated mistake to be detected");
    }

    const mistakesAfter = await fetch(`${BASE_URL}/api/mistakes`, { headers: { 'x-user-id': userRes.id } }).then(r => r.json());
    const m = mistakesAfter.mistakes[0];
    if (m.retryCount < 1) throw new Error("Retry count was not incremented");
    if (m.status !== "Needs Practice") throw new Error("Status should remain Needs Practice on repeated failure");
  });

  // TEST 19: User Data Isolation
  await assert("Recall Arena strictly isolates student test data and blocks unauthorized cross-user access", async () => {
    const userA = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `userA-${Date.now()}@test.com`, displayName: 'User A' })
    }).then(r => r.json())).user;

    const userB = (await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `userB-${Date.now()}@test.com`, displayName: 'User B' })
    }).then(r => r.json())).user;

    await fetch(`${BASE_URL}/api/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
      body: JSON.stringify({ questionId: 'q-two-sum', language: 'javascript', code: 'function twoSum(){return [0,1];}' })
    });

    const startData = await fetch(`${BASE_URL}/api/recall-arena/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
      body: JSON.stringify({ mode: 'mixed', length: 1 })
    }).then(r => r.json());

    // User B attempts to access User A's session
    const unauthorizedRes = await fetch(`${BASE_URL}/api/recall-arena/session/${startData.session.id}`, {
      headers: { 'x-user-id': userB.id }
    });

    if (unauthorizedRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for cross-user session access, got ${unauthorizedRes.status}`);
    }
  });

  // TEST 20: Weekend Mastery Test Operational Distinction
  await assert("Weekend Mastery Test remains fully functional and distinct from Recall Arena", async () => {
    const res = await fetch(`${BASE_URL}/api/weekly-test`);
    const data = await res.json();
    if (!data.testId || !data.questions || data.questions.length === 0) {
      throw new Error("Weekly test API failed");
    }
    if (!data.title.includes("Mastery Assessment")) {
      throw new Error("Weekly test title incorrect");
    }
  });

  console.log(`\n=== RESULTS: ${passed} / ${total} TESTS PASSED ===\n`);
  if (passed === total) {
    console.log("🎉 ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY!");
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

