// CLI Skill: Time Blocker
// Usage: node timeBlocker.js <dayStartHour> <existingEventsJSON> <tasksToBlockJSON>

import path from 'path';

function blockTime(startHourStr, existingEventsStr, tasksStr) {
  const startHour = parseInt(startHourStr, 10) || 9; // default 9 AM
  
  let existingEvents = [];
  let tasks = [];

  try {
    existingEvents = JSON.parse(existingEventsStr || '[]');
  } catch (e) {
    // Fallback if parsing fails or is empty
    existingEvents = [
      { name: "Lectures/Class", start: 10, end: 12 },
      { name: "Lunch Break", start: 13, end: 14 },
      { name: "Gym Routine", start: 17, end: 18 }
    ];
  }

  try {
    tasks = JSON.parse(tasksStr || '[]');
  } catch (e) {
    tasks = [
      { name: "Study AI Capstone", duration: 2 },
      { name: "Write Report", duration: 1.5 },
      { name: "Team Sync", duration: 1 }
    ];
  }

  const calendar = [];
  // Build a 24-hour day schedule starting from startHour
  const dayLength = 14; // block next 14 hours
  let currentHour = startHour;

  // Track occupied hours
  const occupiedHours = new Array(24).fill(false);
  
  // Mark existing events
  existingEvents.forEach(evt => {
    const s = Math.max(0, Math.min(23, Math.floor(evt.start)));
    const e = Math.max(s + 1, Math.min(24, Math.ceil(evt.end)));
    for (let h = s; h < e; h++) {
      occupiedHours[h] = evt.name || "Blocked";
    }
  });

  const scheduledTasks = [];
  const conflicts = [];

  tasks.forEach(task => {
    const duration = Math.ceil(task.duration || 1);
    let foundSlot = false;

    // Search for continuous slot starting from startHour
    for (let h = startHour; h <= 24 - duration; h++) {
      let isFree = true;
      for (let offset = 0; offset < duration; offset++) {
        if (occupiedHours[h + offset]) {
          isFree = false;
          break;
        }
      }

      if (isFree) {
        // Block these hours
        for (let offset = 0; offset < duration; offset++) {
          occupiedHours[h + offset] = task.name;
        }
        scheduledTasks.push({
          name: task.name,
          start: h,
          end: h + duration,
          time: `${h}:00 - ${h + duration}:00`
        });
        foundSlot = true;
        break;
      }
    }

    if (!foundSlot) {
      conflicts.push({
        task: task.name,
        reason: "No consecutive free slot found during active hours."
      });
    }
  });

  // Construct day grid for display
  const timeline = [];
  for (let h = startHour; h < startHour + dayLength; h++) {
    const hour24 = h % 24;
    const label = `${hour24}:00`;
    timeline.push({
      hour: hour24,
      label,
      occupiedBy: occupiedHours[hour24] || "Free"
    });
  }

  return {
    success: true,
    timeline,
    scheduledTasks,
    conflicts
  };
}

function main() {
  const args = process.argv.slice(2);
  const startHour = args[0] || '9';
  const existingEvents = args[1] || '[]';
  const tasks = args[2] || '[]';

  try {
    const result = blockTime(startHour, existingEvents, tasks);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  }
}

main();
