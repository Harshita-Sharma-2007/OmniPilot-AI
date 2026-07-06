import { execFile } from 'child_process';
import path from 'path';

/**
 * Validates simple parameters against safe regex patterns.
 * Prevents command injection characters.
 */
export function sanitizeString(input, maxLength = 200) {
  if (typeof input !== 'string') return '';
  // Truncate to avoid buffer issues
  let sanitized = input.substring(0, maxLength);
  
  // Detect standard shell injection symbols
  const injectionPattern = /[;&|`\$\r\n<>]/g;
  if (injectionPattern.test(sanitized)) {
    throw new Error('Security Violation: Disallowed command injection character detected in input.');
  }

  // Detect path traversal
  if (sanitized.includes('..')) {
    throw new Error('Security Violation: Directory traversal attempts are forbidden.');
  }

  return sanitized;
}

/**
 * Validates task payload arguments to ensure they are safe and properly structured.
 */
export function validateTaskPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid Payload: Must be a non-null object.');
  }
  
  const rules = {
    title: { type: 'string', required: true, max: 100 },
    description: { type: 'string', required: false, max: 500 },
    agent: { type: 'string', required: false, max: 50 },
    priority: { type: 'string', required: false, max: 10 },
  };

  for (const [key, rule] of Object.entries(rules)) {
    const val = payload[key];
    if (rule.required && (val === undefined || val === null)) {
      throw new Error(`Validation Error: Required field '${key}' is missing.`);
    }
    if (val !== undefined && val !== null) {
      if (typeof val !== rule.type) {
        throw new Error(`Validation Error: Field '${key}' must be of type ${rule.type}.`);
      }
      // Sanitize string content
      if (rule.type === 'string') {
        sanitizeString(val, rule.max);
      }
    }
  }

  return true;
}

/**
 * Safely runs a local node skill file using child_process.execFile.
 * ExecFile is inherently safer than exec because it does not spawn a shell,
 * making direct argument injection impossible, but we also apply strict parameter checking.
 * 
 * @param {string} skillPath Relative or absolute path to the skill script.
 * @param {string[]} args Array of arguments to pass to the skill.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export function safeExecuteSkill(skillPath, args = []) {
  return new Promise((resolve, reject) => {
    try {
      // 1. Resolve path and ensure it remains inside the skills directory
      const resolvedSkillPath = path.resolve(skillPath);
      const skillsDir = path.resolve('skills');
      
      if (!resolvedSkillPath.startsWith(skillsDir)) {
        return reject(new Error('Security Violation: Access outside skills directory is denied.'));
      }

      // 2. Validate all arguments for shell inject / traversal attempts
      const sanitizedArgs = args.map(arg => {
        try {
          return sanitizeString(arg, 500);
        } catch (err) {
          throw new Error(`Arg Validation Rejected: ${err.message}`);
        }
      });

      // 3. Execute script using execFile (no shell) with a tight timeout (5s)
      execFile('node', [resolvedSkillPath, ...sanitizedArgs], { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Execution Error: ${error.message}. Output: ${stderr || stdout}`));
        }
        resolve({ stdout, stderr });
      });
    } catch (e) {
      reject(e);
    }
  });
}
