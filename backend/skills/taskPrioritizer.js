// CLI Skill: Task Prioritizer
// Usage: node taskPrioritizer.js <tasksJSON>

import path from 'path';

function prioritizeTasks(tasksStr) {
  let tasks = [];
  try {
    tasks = JSON.parse(tasksStr || '[]');
  } catch (e) {
    tasks = [
      { name: "Submit Capstone Draft", urgent: true, important: true },
      { name: "Plan Weekend Outing", urgent: false, important: false },
      { name: "Reply to Routine Emails", urgent: true, important: false },
      { name: "Study for AI Midterm", urgent: false, important: true }
    ];
  }

  const quadrants = {
    q1: [], // Urgent & Important -> Do First
    q2: [], // Not Urgent & Important -> Schedule
    q3: [], // Urgent & Not Important -> Delegate
    q4: []  // Not Urgent & Not Important -> Eliminate
  };

  tasks.forEach(t => {
    const isUrgent = !!t.urgent;
    const isImportant = !!t.important;

    if (isUrgent && isImportant) {
      quadrants.q1.push(t.name);
    } else if (!isUrgent && isImportant) {
      quadrants.q2.push(t.name);
    } else if (isUrgent && !isImportant) {
      quadrants.q3.push(t.name);
    } else {
      quadrants.q4.push(t.name);
    }
  });

  // Flat prioritized execution order
  const prioritizedOrder = [
    ...quadrants.q1.map(name => ({ name, priority: "Q1 - Do First", quadrant: 1 })),
    ...quadrants.q2.map(name => ({ name, priority: "Q2 - Schedule", quadrant: 2 })),
    ...quadrants.q3.map(name => ({ name, priority: "Q3 - Delegate", quadrant: 3 })),
    ...quadrants.q4.map(name => ({ name, priority: "Q4 - Eliminate", quadrant: 4 }))
  ];

  return {
    success: true,
    quadrants,
    prioritizedOrder
  };
}

function main() {
  const args = process.argv.slice(2);
  const tasksJSON = args[0] || '[]';

  try {
    const result = prioritizeTasks(tasksJSON);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  }
}

main();
