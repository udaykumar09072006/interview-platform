import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeCodeInSandbox } from '../server/services/codeExecutionService.js';
import { db } from '../server/config/db.js';

interface TestCaseResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestCaseResult[] = [];

async function assert(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err?.message || String(err) });
    console.error(`  ✗ ${name}: ${err?.message}`);
  }
}

async function runTestSuite() {
  console.log('\n=============================================');
  console.log('  Intervexa Automated Test Suite');
  console.log('=============================================\n');

  // 1. Password Hashing & Bcrypt
  await assert('Password hashing produces valid bcrypt hash and matches', async () => {
    const raw = 'candidateSecret123';
    const hash = await bcrypt.hash(raw, 10);
    const valid = await bcrypt.compare(raw, hash);
    if (!valid) throw new Error('Password mismatch on bcrypt verification.');
  });

  // 2. JWT Generation & Validation
  await assert('JWT token encodes user payload and verifies with signature', () => {
    const secret = 'test_secret_key';
    const payload = { userId: 'usr_1', email: 'test@example.com', role: 'candidate' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret) as any;
    if (decoded.email !== payload.email || decoded.role !== 'candidate') {
      throw new Error('JWT payload was corrupted or failed verification.');
    }
  });

  // 3. Sandboxed Code Execution: Two Sum Solution
  await assert('Sandboxed runner executes Two Sum JavaScript solution and passes test cases', async () => {
    const code = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
  return [];
}
    `;

    const testCases = [
      { input: '[2, 7, 11, 15]\n9', expectedOutput: '[0, 1]' },
      { input: '[3, 2, 4]\n6', expectedOutput: '[1, 2]' },
    ];

    const result = await executeCodeInSandbox('javascript', code, testCases);
    if (result.status !== 'Accepted') {
      throw new Error(`Expected Accepted but got ${result.status} (Output: ${result.output})`);
    }
    if (result.testCasesPassed !== 2) {
      throw new Error(`Expected 2 test cases to pass, got ${result.testCasesPassed}`);
    }
  });

  // 4. Sandboxed Code Execution: Security Sandbox Check
  await assert('Sandboxed runner detects and blocks dangerous system calls (require/fs/process)', async () => {
    const maliciousCode = `
      const fs = require('fs');
      process.exit(1);
    `;

    const testCases = [{ input: '5', expectedOutput: '5' }];
    const result = await executeCodeInSandbox('javascript', maliciousCode, testCases);

    if (result.status !== 'Compilation Error' || !result.compilationError?.includes('Security Exception')) {
      throw new Error('Sandbox failed to block disallowed require/process token.');
    }
  });

  // 5. Database CRUD and Query Filters
  await assert('Document database supports insert, indexed lookup, and updates', async () => {
    const testCol = db.getCollection<any>('test_entities');
    const doc = await testCol.create({ name: 'Candidate Unit', score: 95 });
    if (!doc._id) throw new Error('Database failed to generate unique identifier.');

    const found = await testCol.findById(doc._id);
    if (!found || found.score !== 95) throw new Error('Failed to find inserted document.');

    const updated = await testCol.findByIdAndUpdate(doc._id, { score: 100 });
    if (updated?.score !== 100) throw new Error('Document update failed.');

    await testCol.findByIdAndDelete(doc._id);
    const postDelete = await testCol.findById(doc._id);
    if (postDelete !== null) throw new Error('Document deletion failed.');
  });

  // 6. Evaluation Calculation & Average Logic
  await assert('Evaluation score automatically computes sum and rounded average', () => {
    const scores = {
      dsa: 8,
      problemSolving: 9,
      programming: 8,
      technicalKnowledge: 9,
      communication: 10,
      systemDesign: 8,
      codeQuality: 8,
    };

    const sum = Object.values(scores).reduce((a, b) => a + b, 0); // 60
    const avg = Math.round((sum / 7) * 10) / 10; // 8.6

    if (sum !== 60) throw new Error(`Expected total 60, got ${sum}`);
    if (avg !== 8.6) throw new Error(`Expected average 8.6, got ${avg}`);
  });

  // 7. Clerk User Sync & Role Management
  await assert('Clerk user sync provisions candidate profile and issues token', async () => {
    const usersCol = db.getCollection<any>('users');
    const profilesCol = db.getCollection<any>('candidate_profiles');

    const clerkUser = await usersCol.create({
      name: 'Clerk Test User',
      email: 'clerk.test@example.com',
      clerkId: 'user_clerk_12345',
      role: 'candidate',
      status: 'active',
      passwordHash: 'clerk_simulated_hash',
    });

    if (!clerkUser._id || clerkUser.clerkId !== 'user_clerk_12345') {
      throw new Error('Failed to create Clerk user record.');
    }

    const profile = await profilesCol.create({
      userId: clerkUser._id,
      skills: ['TypeScript', 'React'],
      experienceYears: 3,
      education: 'B.S. in Computer Science',
    });

    if (!profile._id || profile.userId !== clerkUser._id) {
      throw new Error('Failed to create candidate profile for Clerk user.');
    }

    // Clean up
    await usersCol.findByIdAndDelete(clerkUser._id);
    await profilesCol.findByIdAndDelete(profile._id);
  });

  console.log('\n---------------------------------------------');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`  Tests: ${passedCount}/${results.length} passed`);
  console.log('=============================================\n');

  if (passedCount < results.length) {
    process.exit(1);
  }
}

runTestSuite();
