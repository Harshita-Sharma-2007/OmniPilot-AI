import path from 'path';
import { safeExecuteSkill } from '../security/validator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = __dirname;

const SKILLS_MAP = {
  study: path.join(SKILLS_DIR, 'studyHelper.js'),
  block: path.join(SKILLS_DIR, 'timeBlocker.js'),
  prioritize: path.join(SKILLS_DIR, 'taskPrioritizer.js')
};

/**
 * Executes a skill by name with sanitized arguments.
 * 
 * @param {string} name Skill name ('study', 'block', 'prioritize')
 * @param {string[]} args Command-line arguments
 * @returns {Promise<any>} Parsed JSON result
 */
export async function runSkill(name, args = []) {
  const skillPath = SKILLS_MAP[name];
  if (!skillPath) {
    throw new Error(`Skill Registry: Unknown skill '${name}'.`);
  }

  try {
    const { stdout, stderr } = await safeExecuteSkill(skillPath, args);
    if (stderr && stderr.trim()) {
      console.warn(`Skill warning: ${stderr}`);
    }
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Skill execution failed for '${name}': ${error.message}`);
  }
}

/**
 * Returns available skill list.
 */
export function getAvailableSkills() {
  return Object.keys(SKILLS_MAP);
}
