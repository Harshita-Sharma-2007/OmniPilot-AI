// CLI Skill: Study Helper
// Usage: node studyHelper.js <subject> <daysUntilExam> <hoursPerDay>

import path from 'path';

function generateStudyPlan(subject, days, hours) {
  const parsedDays = parseInt(days, 10) || 7;
  const parsedHours = parseFloat(hours) || 2;

  // Generate milestone topics based on common curriculum divisions
  const topicMilestones = [
    { phase: "Foundations", details: `Review core theories, terms, and foundational papers of ${subject}.` },
    { phase: "Core Mechanics", details: `Analyze medium-complexity concepts, examples, and formulas in ${subject}.` },
    { phase: "Advanced Applications", details: `Work on complex case studies and advanced synthesis of ${subject}.` },
    { phase: "Mock Exams", details: `Complete timed practice papers and perform gap analysis.` },
    { phase: "Final Revision", details: `Review weak areas and study summary flashcards.` }
  ];

  const milestones = [];
  const daysPerPhase = Math.max(1, Math.floor(parsedDays / topicMilestones.length));

  for (let i = 0; i < topicMilestones.length; i++) {
    const startDay = i * daysPerPhase + 1;
    const endDay = Math.min(parsedDays, (i + 1) * daysPerPhase);
    if (startDay <= parsedDays) {
      milestones.push({
        id: `M-${i+1}`,
        title: `${topicMilestones[i].phase} (${subject})`,
        duration: `${(endDay - startDay + 1) * parsedHours} hours total`,
        timeline: `Days ${startDay} - ${endDay}`,
        description: topicMilestones[i].details
      });
    }
  }

  // Generate simulated flashcards
  const flashcards = [
    { q: `What is the core definition/purpose of ${subject}?`, a: `Refer to fundamental course readings, Chapter 1.` },
    { q: `Identify the top 3 critical concepts or frameworks in ${subject}.`, a: `1. Foundations 2. Structural Analysis 3. Multi-variable applications.` },
    { q: `What is a common misconception about ${subject}?`, a: `Assuming simple linear scaling; most systems are non-linear or multi-faceted.` }
  ];

  return {
    success: true,
    subject,
    parameters: { days: parsedDays, hoursPerDay: parsedHours },
    milestones,
    flashcards
  };
}

function main() {
  const args = process.argv.slice(2);
  const subject = args[0] || 'General Studies';
  const days = args[1] || '7';
  const hours = args[2] || '2';

  try {
    const result = generateStudyPlan(subject, days, hours);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  }
}

main();
