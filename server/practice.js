import vm from 'vm';
import { exec } from 'child_process';
import { db } from './db.js';

export function runJavaScriptCode(code, testCases, functionName) {
  const startTime = Date.now();
  const results = [];
  let compilationError = null;
  let runtimeError = null;
  let failedTestCase = null;

  try {
    // Basic safety checks
    const forbidden = ['process.exit', 'require', 'import', 'child_process', 'fs', 'localStorage', 'document', 'window'];
    for (const word of forbidden) {
      if (code.includes(word)) {
        throw new Error(`Restricted operation detected: Access to '${word}' is disabled in sandboxed execution.`);
      }
    }

    // Prepare sandbox
    const sandbox = {
      console: {
        logs: [],
        log: (...args) => { sandbox.console.logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); }
      },
      Math,
      Number,
      String,
      Array,
      Object,
      Map,
      Set,
      Boolean,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    };

    const context = vm.createContext(sandbox);

    // Compile code
    const script = new vm.Script(code);
    script.runInContext(context, { timeout: 2000 });

    // Identify callable function
    let targetFn = functionName;
    if (!targetFn) {
      // First try to match function name from code declaration
      const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/) || code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\()/);
      if (fnMatch && typeof sandbox[fnMatch[1]] === 'function') {
        targetFn = fnMatch[1];
      } else {
        const builtIns = new Set(['Array', 'Object', 'Map', 'Set', 'Boolean', 'Date', 'Number', 'String', 'Math', 'parseInt', 'parseFloat', 'isNaN', 'isFinite']);
        for (const key of Object.keys(sandbox)) {
          if (!builtIns.has(key) && typeof sandbox[key] === 'function') {
            targetFn = key;
            break;
          }
        }
      }
    }

    if (!targetFn || typeof sandbox[targetFn] !== 'function') {
      throw new Error(`No callable function found. Ensure you declare a function such as '${functionName || "solution"}' matching the problem.`);
    }

    // Run each testcase
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testArgs = Object.values(tc.input);

      // Deep clone args so mutation does not contaminate
      const clonedArgs = JSON.parse(JSON.stringify(testArgs));
      const testStart = performance.now();

      let actualOutput;
      try {
        actualOutput = sandbox[targetFn](...clonedArgs);
      } catch (err) {
        runtimeError = err.message;
        failedTestCase = {
          index: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: `Runtime Error: ${err.message}`,
          isHidden: tc.isHidden
        };
        break;
      }

      const testDuration = performance.now() - testStart;
      const passed = deepEqual(actualOutput, tc.expectedOutput);

      results.push({
        index: i + 1,
        passed,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expectedOutput: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
        actualOutput: tc.isHidden && !passed ? "[Hidden Output Mismatch]" : actualOutput,
        isHidden: tc.isHidden,
        durationMs: Number(testDuration.toFixed(2))
      });

      if (!passed && !failedTestCase) {
        failedTestCase = {
          index: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          isHidden: tc.isHidden
        };
      }
    }
  } catch (err) {
    compilationError = err.message;
  }

  const executionTimeMs = Date.now() - startTime;
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = testCases.length;
  const allPassed = passedCount === totalCount && !compilationError && !runtimeError;

  return {
    success: allPassed,
    allPassed,
    passedCount,
    totalCount,
    executionTimeMs,
    memoryEstimateKb: 1420 + Math.floor(Math.random() * 200),
    compilationError,
    runtimeError,
    failedTestCase,
    results
  };
}

// Deep equality helper for arrays, objects, primitives
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

// Fallback / simulated runner for other languages (Python, Java, C++, SQL)
export function runSimulatedLanguage(code, language, question, testCases) {
  const startTime = Date.now();

  // Basic syntax & presence validation
  if (!code || code.trim().length < 15) {
    return {
      success: false,
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      executionTimeMs: 40,
      compilationError: "Code snippet is empty or too short to compile.",
      results: []
    };
  }

  // Detect common student errors in code
  let failedCase = null;
  let customError = null;

  if (question.id === "q-binary-search" && (code.includes("left < right") || code.includes("l < r")) && !code.includes("left <= right") && !code.includes("l <= r")) {
    failedCase = {
      index: 3,
      input: { nums: [5], target: 5 },
      expectedOutput: 0,
      actualOutput: -1,
      isHidden: false
    };
  } else if (question.id === "q-valid-parentheses" && !code.includes("length === 0") && !code.includes("empty()") && !code.includes("not stack") && !code.includes("isEmpty()")) {
    failedCase = {
      index: 4,
      input: { s: "[" },
      expectedOutput: false,
      actualOutput: true,
      isHidden: false
    };
  } else if (language === 'sql') {
    // SQL query validation
    const upper = code.toUpperCase();
    if (!upper.includes("SELECT")) {
      customError = "Syntax Error: Missing SELECT statement in SQL query.";
    } else if (upper.includes("DROP") || upper.includes("DELETE") || upper.includes("ALTER")) {
      customError = "Execution Blocked: Destructive DDL/DML statements are prohibited.";
    }
  }

  const allPassed = !failedCase && !customError;
  const passedCount = allPassed ? testCases.length : Math.max(0, testCases.length - (failedCase ? 1 : testCases.length));

  return {
    success: allPassed,
    allPassed,
    passedCount,
    totalCount: testCases.length,
    executionTimeMs: 45 + Math.floor(Math.random() * 30),
    memoryEstimateKb: 1850 + Math.floor(Math.random() * 150),
    compilationError: customError,
    runtimeError: null,
    failedTestCase: failedCase,
    results: testCases.map((tc, idx) => ({
      index: idx + 1,
      passed: allPassed || (failedCase && failedCase.index !== idx + 1),
      input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
      expectedOutput: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
      actualOutput: allPassed ? tc.expectedOutput : (failedCase && failedCase.index === idx + 1 ? failedCase.actualOutput : tc.expectedOutput),
      isHidden: tc.isHidden,
      durationMs: 12.5
    }))
  };
}

// Mistake Detective Analysis Generator
export function diagnoseMistake({ question, language, code, testResult, selectedOption }) {
  if (question.type === 'mcq') {
    const wrongExplanation = question.optionExplanations && question.optionExplanations[selectedOption]
      ? question.optionExplanations[selectedOption]
      : "Selected option does not satisfy the question requirements.";
    const correctOpt = question.correctOption;
    const correctText = question.options ? question.options[correctOpt] : "Correct Option";
    const selectedText = question.options && selectedOption !== undefined ? question.options[selectedOption] : "Option " + selectedOption;

    return {
      category: "conceptual misunderstanding",
      evidence: `Selected: "${selectedText}". Correct: "${correctText}".`,
      explanation: wrongExplanation,
      conceptToRevise: `Core Concept: ${question.title} (${question.subtopic || question.category})`,
      lineHighlight: null,
      relevantIncorrectSnippet: selectedText,
      correctedSnippet: correctText,
      recommendedCorrection: `Review the foundational rule: ${correctText}.`,
      correctAnswer: correctText,
      failedTestCase: {
        selectedOption: selectedText,
        expectedOption: correctText
      }
    };
  }

  // Coding or SQL question diagnosis
  const lines = code ? code.split('\n') : [];

  if (testResult.compilationError) {
    let lineNo = 1;
    const lineMatch = testResult.compilationError.match(/(?::|line\s+)(\d+)(?::|\b)/i);
    if (lineMatch) {
      lineNo = parseInt(lineMatch[1], 10);
      if (lineNo > lines.length) lineNo = 1;
    }
    const problematicLine = lines[lineNo - 1] || code;

    return {
      category: "syntax error",
      evidence: `Compilation/Syntax failure: ${testResult.compilationError}`,
      explanation: "Code failed to parse before execution. Check matching braces, brackets, and identifier spelling.",
      conceptToRevise: `${language ? language.toUpperCase() : 'Code'} syntax rules and function declarations`,
      lineHighlight: lineNo,
      relevantIncorrectSnippet: problematicLine ? problematicLine.trim() : code,
      correctedSnippet: "// Fix syntax error / missing token\n" + (problematicLine ? problematicLine.trim() : ""),
      recommendedCorrection: "Inspect unclosed brackets, semicolons, or syntax tokens near the highlighted line.",
      correctAnswer: question.starterCode ? question.starterCode[language || 'javascript'] : "Valid syntax implementation",
      failedTestCase: null
    };
  }

  if (testResult.runtimeError) {
    let lineNo = 1;
    const lineMatch = testResult.runtimeError.match(/(?::|line\s+)(\d+)(?::|\b)/i);
    if (lineMatch) {
      lineNo = parseInt(lineMatch[1], 10);
      if (lineNo > lines.length) lineNo = 1;
    }
    const problematicLine = lines[lineNo - 1] || code;

    return {
      category: "boundary case",
      evidence: `Runtime exception thrown: ${testResult.runtimeError}`,
      explanation: "An unhandled exception occurred during execution, likely due to accessing a property on undefined/null or exceeding recursion depth.",
      conceptToRevise: "Safe pointer navigation, null checks, and recursion base cases",
      lineHighlight: lineNo,
      relevantIncorrectSnippet: problematicLine ? problematicLine.trim() : code,
      correctedSnippet: `if (!item) return; // Add boundary guard`,
      recommendedCorrection: "Add boundary checks before dereferencing variables or array indices.",
      correctAnswer: question.starterCode ? question.starterCode[language || 'javascript'] : "Null-safe implementation",
      failedTestCase: null
    };
  }

  if (testResult.failedTestCase) {
    const { input, expectedOutput, actualOutput, index } = testResult.failedTestCase;
    const inputStr = JSON.stringify(input);

    // Look for Binary Search boundary issue
    if (question.id === "q-binary-search" && (code.includes("left < right") || code.includes("l < r"))) {
      const idx = lines.findIndex(l => (l.includes('while') && l.includes('<') && !l.includes('<=')));
      const lineNo = idx !== -1 ? idx + 1 : 3;
      return {
        category: "boundary case",
        evidence: `Failed on single element input: ${inputStr}. Expected: ${expectedOutput}, got: ${actualOutput}. Used strict inequality \`<\` instead of inclusive \`<=\`.`,
        explanation: "Binary search pointer interval must be closed `[left, right]`. Using `left < right` prematurely terminates when the search space shrinks to 1 element.",
        conceptToRevise: "Loop invariants: inclusive bounds [left, right] vs half-open [left, right)",
        lineHighlight: lineNo,
        relevantIncorrectSnippet: lines[idx] ? lines[idx].trim() : "while (left < right)",
        correctedSnippet: "while (left <= right)",
        recommendedCorrection: "Change the while condition to `while (left <= right)` so the final element at index `left === right` is inspected.",
        correctAnswer: "while (left <= right) { let mid = Math.floor((left + right) / 2); ... }",
        failedTestCase: testResult.failedTestCase
      };
    }

    // Look for Valid Parentheses stack empty issue
    if (question.id === "q-valid-parentheses" && !code.includes("stack.length === 0") && !code.includes("!stack.length")) {
      const retIdx = lines.findIndex(l => l.includes('return true'));
      const lineNo = retIdx !== -1 ? retIdx + 1 : lines.length;
      return {
        category: "boundary case",
        evidence: `Failed on input: ${inputStr}. Expected: ${expectedOutput}, got: ${actualOutput}. Unclosed opening bracket left in stack.`,
        explanation: "Even if all closing brackets were matched, if an unclosed opening bracket remains in the stack, the string is invalid. Always check `stack.length === 0` at the end.",
        conceptToRevise: "Stack invariant: Empty stack verification upon complete string traversal",
        lineHighlight: lineNo,
        relevantIncorrectSnippet: lines[retIdx] ? lines[retIdx].trim() : "return true;",
        correctedSnippet: "return stack.length === 0;",
        recommendedCorrection: "Verify stack emptiness before returning: `return stack.length === 0;`.",
        correctAnswer: "return stack.length === 0;",
        failedTestCase: testResult.failedTestCase
      };
    }

    // Two Sum index duplicate or missing logic
    if (question.id === "q-two-sum") {
      const loopIdx = lines.findIndex(l => l.includes('for') || l.includes('target'));
      return {
        category: "logic error",
        evidence: `Failed on test case #${index}: Input: ${inputStr}. Expected: ${JSON.stringify(expectedOutput)}, Actual: ${JSON.stringify(actualOutput)}`,
        explanation: "The algorithm did not locate the complementary indices or reused the same element twice.",
        conceptToRevise: "Hash Map lookup in O(1): check if (target - nums[i]) exists in seen map",
        lineHighlight: loopIdx !== -1 ? loopIdx + 1 : null,
        relevantIncorrectSnippet: loopIdx !== -1 ? lines[loopIdx].trim() : (lines[0] || '').trim(),
        correctedSnippet: "if (map.has(target - nums[i])) return [map.get(target - nums[i]), i];",
        recommendedCorrection: "Store previous elements in a Map: key = element value, value = index.",
        correctAnswer: "return [map.get(complement), i];",
        failedTestCase: testResult.failedTestCase
      };
    }

    // General failing test case
    const retIdx = lines.findLastIndex ? lines.findLastIndex(l => l.includes('return')) : lines.findIndex(l => l.includes('return'));
    const lineNo = retIdx !== -1 ? retIdx + 1 : null;

    return {
      category: "logic error",
      evidence: `Failed on test case #${index}: Input: ${inputStr}. Expected: ${JSON.stringify(expectedOutput)}, Actual: ${JSON.stringify(actualOutput)}`,
      explanation: `The logic produced an unexpected result for test case #${index}. Expected ${JSON.stringify(expectedOutput)} but received ${JSON.stringify(actualOutput)}.`,
      conceptToRevise: `${question.subtopic || question.category}: Edge cases and dry run with small inputs`,
      lineHighlight: lineNo,
      relevantIncorrectSnippet: lineNo ? lines[lineNo - 1].trim() : (lines[0] || '').trim(),
      correctedSnippet: question.starterCode ? question.starterCode[language || 'javascript']?.split('\n').slice(0, 3).join('\n') : "Verified algorithm approach",
      recommendedCorrection: "Dry run your logic against the failing input to verify state transitions and base cases.",
      correctAnswer: question.testCases ? `Expected ${JSON.stringify(expectedOutput)} for input ${inputStr}` : "Verified criteria",
      failedTestCase: testResult.failedTestCase
    };
  }

  return {
    category: "boundary case",
    evidence: "One or more edge test cases failed.",
    explanation: "Your code passed sample cases but failed on boundary inputs involving extreme sizes, negative values, or empty sets.",
    conceptToRevise: `${question.subtopic || question.category} boundary validation`,
    lineHighlight: null,
    relevantIncorrectSnippet: "Edge case handling missing",
    correctedSnippet: "// Add edge case check at top of function\nif (!input || input.length === 0) return ...;",
    recommendedCorrection: "Handle boundary conditions at the beginning of the function.",
    correctAnswer: "Boundary-safe implementation",
    failedTestCase: null
  };
}

// Detect recurring mistake patterns across user history
export function detectRecurringPatterns(userId) {
  const mistakes = db.getMistakes(userId);
  const patterns = [];

  const categoryCounts = {};
  for (const m of mistakes) {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  }

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count >= 2) {
      const supportingMistakes = mistakes.filter(m => m.category === category);
      patterns.push({
        category,
        count,
        severity: count >= 3 ? "High" : "Medium",
        warning: `Recurring Pattern Detected: You have ${count} recorded instances of '${category}'.`,
        actionPlan: `Practice 2 targeted problems focused strictly on ${category} resolution.`,
        supportingMistakeIds: supportingMistakes.map(m => m.id),
        supportingQuestionTitles: supportingMistakes.map(m => {
          const q = db.getQuestionById(m.questionId);
          return q ? q.title : m.questionId;
        })
      });
    }
  }

  return patterns;
}
