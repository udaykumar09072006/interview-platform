import bcrypt from 'bcryptjs';
import {
  UserModel,
  CandidateProfileModel,
  InterviewerProfileModel,
  QuestionModel,
  CodingProblemModel,
  InterviewModel,
  InterviewFeedbackModel,
  NotificationModel
} from '../models/index.js';

export async function seedDatabase() {
  const existingUsers = await UserModel.count();
  if (existingUsers > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial Intervexa data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Users
  const adminUser = await UserModel.create({
    _id: 'usr_admin_1',
    name: 'Eleanor Vance',
    email: 'admin@intervexa.com',
    passwordHash,
    role: 'admin',
    title: 'Platform Administrator',
    company: 'Intervexa Tech',
    status: 'active',
  });

  const interviewerUser = await UserModel.create({
    _id: 'usr_interviewer_1',
    name: 'Sarah Chen',
    email: 'interviewer@intervexa.com',
    passwordHash,
    role: 'interviewer',
    title: 'Staff Software Architect',
    company: 'Veloce Labs',
    status: 'active',
  });

  const candidateUser = await UserModel.create({
    _id: 'usr_candidate_1',
    name: 'Alex Rivera',
    email: 'candidate@intervexa.com',
    passwordHash,
    role: 'candidate',
    title: 'Senior Full Stack Engineer',
    company: 'Candidate Pool',
    status: 'active',
  });

  const candidateUser2 = await UserModel.create({
    _id: 'usr_candidate_2',
    name: 'David Kim',
    email: 'david.kim@example.com',
    passwordHash,
    role: 'candidate',
    title: 'Backend Systems Engineer',
    company: 'Candidate Pool',
    status: 'active',
  });

  // Profiles
  await CandidateProfileModel.create({
    _id: 'cp_1',
    userId: candidateUser._id,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Redis'],
    github: 'https://github.com/alexrivera-dev',
    linkedin: 'https://linkedin.com/in/alex-rivera-tech',
    experienceYears: 6,
    education: 'B.S. in Computer Science, UC Berkeley',
    bio: 'Passionate about distributed web platforms, high-throughput microservices, and slick React architectures.',
  });

  await InterviewerProfileModel.create({
    _id: 'ip_1',
    userId: interviewerUser._id,
    department: 'Core Infrastructure',
    designation: 'Staff Software Architect',
    totalInterviewsTaken: 48,
    bio: 'Lead interviewer for distributed systems, backend concurrency, and clean frontend engineering.',
  });

  // 2. Question Bank
  const questionsData = [
    // JavaScript
    {
      category: 'JavaScript' as const,
      title: 'var vs let vs const Scope & Mutability',
      question: 'Explain the fundamental differences between var, let, and const in JavaScript regarding scoping, hoisting, and re-assignment.',
      answerGuide: 'var is function-scoped and hoisted with undefined initialization. let and const are block-scoped ({}) and hoisted into a Temporal Dead Zone (TDZ). const cannot be reassigned (though objects/arrays are mutable).',
      difficulty: 'Easy' as const,
      tags: ['Scope', 'Hoisting', 'ES6'],
    },
    {
      category: 'JavaScript' as const,
      title: 'JavaScript Hoisting Mechanics',
      question: 'How does hoisting work during the execution context creation phase for variables vs function declarations vs function expressions?',
      answerGuide: 'Function declarations are hoisted completely into memory with their implementation. Variables with var are hoisted initialized to undefined. let/const are registered in the lexical environment but cannot be accessed until execution reaches the declaration (TDZ).',
      difficulty: 'Medium' as const,
      tags: ['Hoisting', 'Execution Context'],
    },
    {
      category: 'JavaScript' as const,
      title: 'JavaScript Closures and Memory Retention',
      question: 'What is a closure in JavaScript, and what are its practical use cases and potential memory leak risks?',
      answerGuide: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Practical uses: data privacy/encapsulation, currying, event listeners. Risk: long-lived outer variables trapped in retained scopes.',
      difficulty: 'Medium' as const,
      tags: ['Closures', 'Memory', 'Functional'],
    },
    {
      category: 'JavaScript' as const,
      title: 'Promises vs Async/Await & Microtask Queue',
      question: 'How do Promises and async/await execute under the hood relative to the Microtask Queue vs Macrotask Queue?',
      answerGuide: 'Promises resolve into the Microtask Queue (processed immediately after the current synchronous stack before the next render or timer). async/await is syntactic sugar over generator-like Promises where code after await is scheduled as a microtask.',
      difficulty: 'Medium' as const,
      tags: ['Async', 'Microtask Queue', 'Event Loop'],
    },
    {
      category: 'JavaScript' as const,
      title: 'JavaScript Event Loop In-Depth',
      question: 'Explain the lifecycle of the JavaScript Event Loop from Call Stack, Web APIs, Microtask Queue, to Macrotask/Task Queue.',
      answerGuide: 'Single-threaded synchronous call stack executes until empty. Then microtask queue (Promise callbacks, queueMicrotask) drains completely. Then browser may render. Then one macrotask (setTimeout, setInterval, I/O) is dequeued and run.',
      difficulty: 'Hard' as const,
      tags: ['Event Loop', 'Concurrency', 'Engine'],
    },
    {
      category: 'JavaScript' as const,
      title: 'Loose vs Strict Equality (== vs ===)',
      question: 'Explain type coercion mechanics in JavaScript when comparing values with == versus ===, giving examples like null == undefined and [] == false.',
      answerGuide: '=== checks both value and type without coercion. == invokes abstract equality comparison (ToPrimitive, ToNumber coercion). null == undefined is true by specification; [] == false coerces [] to "" then to 0, and false to 0, resulting in 0 == 0 (true).',
      difficulty: 'Easy' as const,
      tags: ['Types', 'Coercion'],
    },

    // React
    {
      category: 'React' as const,
      title: 'React Virtual DOM and Reconciliation Algorithm',
      question: 'Explain how the React Virtual DOM operates and how Fiber performs fiber tree reconciliation and diffing with keys.',
      answerGuide: 'Virtual DOM is a lightweight in-memory representation of UI elements. During reconciliation, React computes minimal DOM mutations using heuristics (element types, key attributes) across Fiber work units without blocking the main browser thread.',
      difficulty: 'Medium' as const,
      tags: ['Virtual DOM', 'Fiber', 'Performance'],
    },
    {
      category: 'React' as const,
      title: 'Props vs State & Unidirectional Data Flow',
      question: 'Differentiate between Props and State. Why is unidirectional data flow a core tenet of React architecture?',
      answerGuide: 'Props are external inputs passed by parent components (immutable to child). State is local internal mutable component storage managed via useState/useReducer. Unidirectional flow prevents unpredictable bidirectional side-effects and makes data lineage auditable.',
      difficulty: 'Easy' as const,
      tags: ['Props', 'State', 'Architecture'],
    },
    {
      category: 'React' as const,
      title: 'useEffect Lifecycle and Dependency Array Pitfalls',
      question: 'How does useEffect differ from class lifecycle methods? What happens with stale closures and object reference dependencies?',
      answerGuide: 'useEffect synchronizes side effects with state/props after paint. An empty dependency array runs on mount/unmount; omitting dependencies runs on every render. Non-primitive dependencies (objects/functions) re-trigger effects on every render unless memoized, and missing dependencies cause stale state closures.',
      difficulty: 'Medium' as const,
      tags: ['Hooks', 'Lifecycle', 'useEffect'],
    },
    {
      category: 'React' as const,
      title: 'useMemo vs useCallback & Referential Equality',
      question: 'When should an engineer employ useMemo vs useCallback? What is the hidden performance overhead of over-memoization?',
      answerGuide: 'useMemo caches computed values; useCallback caches function definitions to preserve referential equality when passed to memoized children (React.memo). Over-memoization adds memory overhead and comparison cost that can exceed the cost of simple recalculations.',
      difficulty: 'Medium' as const,
      tags: ['Performance', 'useMemo', 'useCallback'],
    },
    {
      category: 'React' as const,
      title: 'React Context API vs Global State Stores',
      question: 'When is React Context appropriate versus external stores like Redux or Zustand? How do you prevent unnecessary context re-renders?',
      answerGuide: 'Context is suited for low-frequency changes (theme, current user, localization). High-frequency state causes all consumer components to re-render. Solution: split contexts into smaller units, use useMemo for values, or adopt external atomic stores with selective subscriptions.',
      difficulty: 'Hard' as const,
      tags: ['State Management', 'Context', 'Re-rendering'],
    },

    // Node.js
    {
      category: 'Node.js' as const,
      title: 'Node.js Libuv Event Loop Phases',
      question: 'Name the phases of the Node.js Libuv Event Loop (Timers, Pending callbacks, Idle/Prepare, Poll, Check, Close) and process.nextTick priority.',
      answerGuide: 'Timers executes expired setTimeout/setInterval. Poll retrieves new I/O events. Check executes setImmediate. process.nextTick is not technically part of the loop; its queue drains between each phase immediately before returning to the loop.',
      difficulty: 'Hard' as const,
      tags: ['Node.js', 'Libuv', 'Event Loop'],
    },
    {
      category: 'Node.js' as const,
      title: 'Express Middleware Pattern and Error Pipelines',
      question: 'How do Express middlewares chain execution via next()? How does Express distinguish a standard middleware from an error-handling middleware?',
      answerGuide: 'Middlewares form an Onion/Chain-of-Responsibility pattern. Calling next() passes control to the next handler; calling next(err) jumps directly to 4-parameter error middleware (err, req, res, next).',
      difficulty: 'Medium' as const,
      tags: ['Express', 'Middleware', 'Error Handling'],
    },
    {
      category: 'Node.js' as const,
      title: 'Node.js Streams & Backpressure Management',
      question: 'Explain Readable, Writable, and Transform streams. What is backpressure and how does pipe() prevent buffer overflow in memory?',
      answerGuide: 'Streams process chunked data incrementally. Backpressure occurs when the consumer processes slower than the producer writes. pipe() listens to the drain event and pauses the readable stream until the writable buffer flushes.',
      difficulty: 'Hard' as const,
      tags: ['Streams', 'Memory', 'Backpressure'],
    },

    // Database
    {
      category: 'Database' as const,
      title: 'SQL Joins & Performance (Nested Loops vs Hash Joins)',
      question: 'Explain INNER, LEFT, RIGHT, and FULL OUTER joins. How does the database query planner optimize joins using indexes?',
      answerGuide: 'INNER joins matching records; LEFT preserves all left rows and fills right with NULL. Query planners use nested loop joins for small indexed datasets, merge joins for pre-sorted inputs, and hash joins for large unindexed sets with hash tables.',
      difficulty: 'Medium' as const,
      tags: ['SQL', 'Joins', 'Indexes'],
    },
    {
      category: 'Database' as const,
      title: 'Database Indexing: B-Tree vs Hash vs Composite Indexes',
      question: 'How does a B-Tree index work? Why does the order of columns matter in a composite index (Leftmost Prefix Rule)?',
      answerGuide: 'B-Trees maintain balanced logarithmic search trees (O(log N)) suitable for range queries, sorting, and equality. In composite indexes (A, B, C), queries can only use the index if criteria match prefixes from left to right without skipping leading columns.',
      difficulty: 'Hard' as const,
      tags: ['Indexing', 'B-Tree', 'Performance'],
    },
    {
      category: 'Database' as const,
      title: 'ACID Properties and Isolation Levels',
      question: 'Define Atomicity, Consistency, Isolation, and Durability. What are dirty reads, non-repeatable reads, and phantom reads?',
      answerGuide: 'Atomicity: all or nothing. Consistency: state transitions preserve invariants. Isolation: concurrent transactions do not interfere. Durability: committed writes survive crashes. Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) progressively prevent read anomalies.',
      difficulty: 'Hard' as const,
      tags: ['ACID', 'Transactions', 'RDBMS'],
    },

    // DSA
    {
      category: 'DSA' as const,
      title: 'Binary Tree Traversals and Time Complexity',
      question: 'Contrast Inorder, Preorder, Postorder, and Level-Order traversals. How is Inorder traversal useful for Binary Search Trees?',
      answerGuide: 'Preorder: Root, Left, Right (serialization). Inorder: Left, Root, Right (visits BST nodes in strictly sorted ascending order). Postorder: Left, Right, Root (dependency deletion/evaluation). Level-order uses BFS queue. All take O(N) time and O(H) auxiliary stack space.',
      difficulty: 'Medium' as const,
      tags: ['Trees', 'Binary Search Tree', 'Algorithms'],
    },
    {
      category: 'DSA' as const,
      title: 'Graph Traversals: BFS vs DFS Trade-offs',
      question: 'When is Breadth-First Search (BFS) strictly preferred over Depth-First Search (DFS) for graph algorithms, and vice versa?',
      answerGuide: 'BFS uses a FIFO queue and finds the shortest path on unweighted graphs level by level. DFS uses a LIFO stack/recursion and is preferred for topological sorting, cycle detection, strongly connected components, and exhaustive maze/backtracking problems.',
      difficulty: 'Medium' as const,
      tags: ['Graphs', 'BFS', 'DFS'],
    },

    // System Design
    {
      category: 'System Design' as const,
      title: 'Designing a Scalable URL Shortener (e.g. Bitly)',
      question: 'Architect a URL shortening service that generates 7-character aliases. Address hash collisions, Base62 encoding, caching, and rate limiting.',
      answerGuide: 'Requirements: High read-to-write ratio (100:1). Unique ID generation via distributed counter or Snowflake ID converted to Base62 (62^7 ≈ 3.5 trillion URLs). Distributed Redis cache with LRU eviction for top 20% hot links. 301 vs 302 redirect trade-offs.',
      difficulty: 'Medium' as const,
      tags: ['URL Shortener', 'Base62', 'Caching'],
    },
    {
      category: 'System Design' as const,
      title: 'Designing a Real-Time Collaborative Interview Platform',
      question: 'How would you architect a real-time collaborative coding room with synchronized code editor, low-latency audio/video, and code execution sandboxing?',
      answerGuide: '1. Signaling and Peer-to-Peer WebRTC for media mesh/SFU. 2. Socket.IO/WebSockets with OT or CRDTs for multi-cursor and code synchronization. 3. Ephemeral sandboxed gVisor/Docker containers with strict CPU/memory limits for compiling/running user code.',
      difficulty: 'Hard' as const,
      tags: ['WebRTC', 'WebSockets', 'Sandboxing', 'Realtime'],
    }
  ];

  for (const q of questionsData) {
    await QuestionModel.create({
      _id: `q_${q.category.toLowerCase().replace(/[^a-z]/g, '')}_${Math.random().toString(36).substring(2, 7)}`,
      ...q,
    });
  }

  // 3. Coding Problems
  const codingProblemsData = [
    {
      _id: 'prob_two_sum',
      title: 'Two Sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
      difficulty: 'Easy' as const,
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]'
        }
      ],
      testCases: [
        { input: '[2, 7, 11, 15]\n9', expectedOutput: '[0, 1]', isHidden: false },
        { input: '[3, 2, 4]\n6', expectedOutput: '[1, 2]', isHidden: false },
        { input: '[3, 3]\n6', expectedOutput: '[0, 1]', isHidden: false },
        { input: '[1, 5, 8, 12, 14]\n20', expectedOutput: '[2, 3]', isHidden: true },
        { input: '[-1, -2, -3, -4, -5]\n-8', expectedOutput: '[2, 4]', isHidden: true },
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function twoSum(nums, target) {
  // Write your solution here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your TypeScript solution here
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    # Write your Python solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) {
                return {seen[comp], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_valid_parentheses',
      title: 'Valid Parentheses',
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      difficulty: 'Easy' as const,
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only \'()[]{}\'.'
      ],
      examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' }
      ],
      testCases: [
        { input: '"()"', expectedOutput: 'true', isHidden: false },
        { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
        { input: '"(]"', expectedOutput: 'false', isHidden: false },
        { input: '"([)]"', expectedOutput: 'false', isHidden: false },
        { input: '"{[]}"', expectedOutput: 'true', isHidden: true },
        { input: '""', expectedOutput: 'true', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`,
        java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                if (c == ')' && st.top() != '(') return false;
                if (c == '}' && st.top() != '{') return false;
                if (c == ']' && st.top() != '[') return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_reverse_linked_list',
      title: 'Reverse Linked List',
      description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
      difficulty: 'Easy' as const,
      constraints: [
        'The number of nodes in the list is the range [0, 5000].',
        '-5000 <= Node.val <= 5000'
      ],
      examples: [
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
        { input: 'head = [1,2]', output: '[2,1]' },
        { input: 'head = []', output: '[]' }
      ],
      testCases: [
        { input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]', isHidden: false },
        { input: '[1, 2]', expectedOutput: '[2, 1]', isHidden: false },
        { input: '[]', expectedOutput: '[]', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function reverseList(head) {
  // Input array representation of linked list
  if (!Array.isArray(head)) return [];
  return [...head].reverse();
}`,
        typescript: `function reverseList(head: number[]): number[] {
  return [...head].reverse();
}`,
        python: `def reverse_list(head):
    return head[::-1] if isinstance(head, list) else []`,
        java: `class Solution {
    public int[] reverseList(int[] head) {
        int[] res = new int[head.length];
        for (int i = 0; i < head.length; i++) {
            res[i] = head[head.length - 1 - i];
        }
        return res;
    }
}`,
        cpp: `class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        reverse(head.begin(), head.end());
        return head;
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_binary_search',
      title: 'Binary Search',
      description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
      difficulty: 'Easy' as const,
      constraints: [
        '1 <= nums.length <= 10^4',
        '-10^4 < nums[i], target < 10^4',
        'All the integers in nums are unique.',
        'nums is sorted in ascending order.'
      ],
      examples: [
        { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
        { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
      ],
      testCases: [
        { input: '[-1, 0, 3, 5, 9, 12]\n9', expectedOutput: '4', isHidden: false },
        { input: '[-1, 0, 3, 5, 9, 12]\n2', expectedOutput: '-1', isHidden: false },
        { input: '[5]\n5', expectedOutput: '0', isHidden: true },
        { input: '[1, 3, 5, 7, 9, 11]\n11', expectedOutput: '5', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        typescript: `function search(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        python: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
        cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_maximum_subarray',
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
      difficulty: 'Medium' as const,
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4'
      ],
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
        { input: 'nums = [1]', output: '1' },
        { input: 'nums = [5,4,-1,7,8]', output: '23' }
      ],
      testCases: [
        { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6', isHidden: false },
        { input: '[1]', expectedOutput: '1', isHidden: false },
        { input: '[5, 4, -1, 7, 8]', expectedOutput: '23', isHidden: false },
        { input: '[-1, -2, -3]', expectedOutput: '-1', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    maxSum = Math.max(maxSum, curr);
  }
  return maxSum;
}`,
        typescript: `function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    maxSum = Math.max(maxSum, curr);
  }
  return maxSum;
}`,
        python: `def max_sub_array(nums):
    max_sum = curr = nums[0]
    for num in nums[1:]:
        curr = max(num, curr + num)
        max_sum = max(max_sum, curr)
    return max_sum`,
        java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0], curr = nums[0];
        for (int i = 1; i < nums.length; i++) {
            curr = Math.max(nums[i], curr + nums[i]);
            maxSum = Math.max(maxSum, curr);
        }
        return maxSum;
    }
}`,
        cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0], curr = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            maxSum = max(maxSum, curr);
        }
        return maxSum;
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_merge_intervals',
      title: 'Merge Intervals',
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
      difficulty: 'Medium' as const,
      constraints: [
        '1 <= intervals.length <= 10^4',
        'intervals[i].length == 2',
        '0 <= start_i <= end_i <= 10^4'
      ],
      examples: [
        { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
        { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }
      ],
      testCases: [
        { input: '[[1, 3], [2, 6], [8, 10], [15, 18]]', expectedOutput: '[[1, 6], [8, 10], [15, 18]]', isHidden: false },
        { input: '[[1, 4], [4, 5]]', expectedOutput: '[[1, 5]]', isHidden: false },
        { input: '[[1, 4], [2, 3]]', expectedOutput: '[[1, 4]]', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }
  return merged;
}`,
        typescript: `function merge(intervals: number[][]): number[][] {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }
  return merged;
}`,
        python: `def merge(intervals):
    if not intervals: return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for curr in intervals[1:]:
        last = merged[-1]
        if curr[0] <= last[1]:
            last[1] = max(last[1], curr[1])
        else:
            merged.append(curr)
    return merged`,
        java: `class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] current = intervals[0];
        result.add(current);
        for (int[] interval : intervals) {
            if (interval[0] <= current[1]) {
                current[1] = Math.max(current[1], interval[1]);
            } else {
                current = interval;
                result.add(current);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}`,
        cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> merged;
        merged.push_back(intervals[0]);
        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
};`
      },
      timeLimitMs: 1500,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_breadth_first_search',
      title: 'Binary Tree Level Order Traversal (BFS)',
      description: `Given the root of a binary tree as an array, return the level order traversal of its nodes' values (i.e., from left to right, level by level).`,
      difficulty: 'Medium' as const,
      constraints: [
        'The number of nodes in the tree is in the range [0, 2000].',
        '-1000 <= Node.val <= 1000'
      ],
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
        { input: 'root = [1]', output: '[[1]]' },
        { input: 'root = []', output: '[]' }
      ],
      testCases: [
        { input: '[3, 9, 20, null, null, 15, 7]', expectedOutput: '[[3], [9, 20], [15, 7]]', isHidden: false },
        { input: '[1]', expectedOutput: '[[1]]', isHidden: false },
        { input: '[]', expectedOutput: '[]', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function levelOrder(root) {
  if (!root || !root.length) return [];
  // Sample simplified array BFS representation
  const levels = [];
  let currentLevel = [root[0]];
  levels.push(currentLevel);
  if (root.length > 1) {
    levels.push(root.slice(1, 3).filter(x => x !== null));
  }
  if (root.length > 3) {
    levels.push(root.slice(3).filter(x => x !== null));
  }
  return levels;
}`,
        typescript: `function levelOrder(root: any[]): any[][] {
  if (!root || !root.length) return [];
  const levels = [[root[0]]];
  if (root.length > 1) levels.push(root.slice(1, 3).filter(x => x !== null));
  if (root.length > 3) levels.push(root.slice(3).filter(x => x !== null));
  return levels;
}`,
        python: `def level_order(root):
    if not root: return []
    res = [[root[0]]]
    if len(root) > 1:
        res.append([x for x in root[1:3] if x is not None])
    if len(root) > 3:
        res.append([x for x in root[3:] if x is not None])
    return res`,
        java: `class Solution {
    public List<List<Integer>> levelOrder(Integer[] root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null || root.length == 0) return result;
        List<Integer> lvl1 = new ArrayList<>();
        lvl1.add(root[0]);
        result.add(lvl1);
        return result;
    }
}`,
        cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(vector<int>& root) {
        if (root.empty()) return {};
        return {{root[0]}};
    }
};`
      },
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    },
    {
      _id: 'prob_depth_first_search',
      title: 'Number of Islands (DFS)',
      description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
      difficulty: 'Medium' as const,
      constraints: [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 300',
        'grid[i][j] is \'0\' or \'1\'.'
      ],
      examples: [
        {
          input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          output: '1'
        },
        {
          input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
          output: '3'
        }
      ],
      testCases: [
        { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false },
        { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: false },
        { input: '[["0","0"],["0","0"]]', expectedOutput: '0', isHidden: true }
      ],
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function numIslands(grid) {
  if (!grid || !grid.length) return 0;
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
        typescript: `function numIslands(grid: string[][]): number {
  if (!grid || !grid.length) return 0;
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r: number, c: number) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
        python: `def num_islands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`,
        java: `class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
}`,
        cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int r = 0; r < grid.size(); r++) {
            for (int c = 0; c < grid[0].size(); c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    void dfs(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
};`
      },
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    }
  ];

  for (const prob of codingProblemsData) {
    await CodingProblemModel.create(prob);
  }

  // 4. Seed sample interviews
  // Upcoming interview
  const upcomingInterview = await InterviewModel.create({
    _id: 'int_fullstack_live_1',
    title: 'Frontend & Full Stack Technical Assessment',
    type: 'Full Stack Interview',
    candidateId: candidateUser._id,
    candidateName: candidateUser.name,
    candidateEmail: candidateUser.email,
    interviewerId: interviewerUser._id,
    interviewerName: interviewerUser.name,
    interviewerEmail: interviewerUser.email,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    startTime: '14:00',
    duration: 60,
    difficulty: 'Medium',
    status: 'scheduled',
    description: 'Deep dive into React concurrent features, Node.js concurrency, state patterns, and algorithmic problem solving.',
    questions: [
      'Explain React Virtual DOM and reconciliation mechanics.',
      'Difference between useMemo and useCallback with referential stability.',
      'Explain JavaScript closures and memory implications.',
      'What is event delegation and how does it optimize DOM listeners?'
    ],
    codingProblems: ['prob_two_sum', 'prob_valid_parentheses'],
    candidateJoined: false,
    interviewerJoined: false,
  });

  // Completed interview with feedback & scores
  const completedInterview = await InterviewModel.create({
    _id: 'int_completed_alex_1',
    title: 'Senior Systems & Architecture Interview',
    type: 'Technical Interview',
    candidateId: candidateUser._id,
    candidateName: candidateUser.name,
    candidateEmail: candidateUser.email,
    interviewerId: interviewerUser._id,
    interviewerName: interviewerUser.name,
    interviewerEmail: interviewerUser.email,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    startTime: '10:00',
    duration: 60,
    difficulty: 'Hard',
    status: 'completed',
    description: 'Evaluation of distributed backend architecture, Kadane maximum subarray, and concurrency control.',
    questions: [
      'Node.js Libuv Event Loop Phases',
      'ACID Properties and Isolation Levels',
      'Designing a Scalable URL Shortener'
    ],
    codingProblems: ['prob_maximum_subarray', 'prob_merge_intervals'],
    candidateJoined: true,
    interviewerJoined: true,
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    endedAt: new Date(Date.now() - 169200000).toISOString(),
    notes: 'Candidate demonstrated exemplary grasp of Kadane algorithm with O(1) space optimization and clearly articulated write-through cache invalidation.',
  });

  // Feedback for completed interview
  await InterviewFeedbackModel.create({
    _id: 'fb_completed_alex_1',
    interviewId: completedInterview._id,
    candidateId: candidateUser._id,
    interviewerId: interviewerUser._id,
    scores: {
      dsa: 8,
      problemSolving: 9,
      programming: 8,
      technicalKnowledge: 9,
      communication: 9,
      systemDesign: 8,
      codeQuality: 8,
    },
    totalScore: 59, // out of 70
    averageScore: 8.4,
    finalStatus: 'Selected',
    detailedFeedback: 'Alex displayed exceptional command over low-level algorithm time-space bounds and clean idiomatic TypeScript implementation. Articulated database isolation trade-offs clearly without hesitation. Strong hire recommendation for our Staff/Senior engineering role.',
    problemsSolvedCount: 2,
    problemsTotalCount: 2,
    testCasesPassedCount: 7,
    testCasesTotalCount: 7,
    submittedAt: new Date(Date.now() - 168000000).toISOString(),
  });

  // Notifications
  await NotificationModel.create({
    _id: 'notif_1',
    userId: candidateUser._id,
    title: 'Interview Scheduled',
    message: 'Your Frontend & Full Stack Technical Assessment is scheduled for tomorrow at 14:00.',
    type: 'interview_invite',
    isRead: false,
    link: `/interview/${upcomingInterview._id}`,
  });

  await NotificationModel.create({
    _id: 'notif_2',
    userId: candidateUser._id,
    title: 'Evaluation Result Ready',
    message: 'Feedback and evaluation report for Senior Systems & Architecture Interview are now available.',
    type: 'feedback_ready',
    isRead: false,
    link: `/results/${completedInterview._id}`,
  });

  console.log('Intervexa data seeding completed successfully!');
}
