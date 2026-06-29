import { db, questionsTable, roadSignsTable } from '../lib/db/src/index.ts';

async function seed() {
  console.log("🌱 Seeding database...");

  const questions = [
    {
      text: "When should you use your hooter in a built-up area?",
      options: ["To greet friends", "Only to avoid an accident", "To get people out of your way", "When you are angry"],
      correctAnswer: 1,
      category: "General Rules",
      difficulty: "easy",
      explanation: "In built-up areas, the hooter should only be used as a warning to avoid a potential collision or accident.",
    },
    {
      text: "What is the general speed limit for a light motor vehicle on a wide tarred road in Zimbabwe?",
      options: ["80 km/h", "100 km/h", "120 km/h", "60 km/h"],
      correctAnswer: 2,
      category: "General Rules",
      difficulty: "medium",
      explanation: "On wide tarred roads (highways), the general speed limit for light motor vehicles is 120 km/h unless otherwise stated.",
    },
    {
      text: "What does a solid white line in the middle of the road mean?",
      options: ["You may overtake", "Overtaking is permitted if clear", "You must not cross or straddle the line", "Parking is allowed"],
      correctAnswer: 2,
      category: "Road Markings",
      difficulty: "easy",
      explanation: "A solid white line indicates that you must not cross or straddle it, usually because it's dangerous to overtake there.",
    },
    {
      text: "At an uncontrolled intersection, who has the right of way?",
      options: ["The faster vehicle", "The vehicle on the right", "The vehicle on the left", "The larger vehicle"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "In Zimbabwe, at an uncontrolled intersection, you must give way to traffic approaching from your right.",
    },
    {
      text: "When are you allowed to drive on the right-hand side of a road with two-way traffic?",
      options: ["When you are in a hurry", "To overtake when it is safe to do so", "Never", "When the road is empty"],
      correctAnswer: 1,
      category: "General Rules",
      difficulty: "easy",
      explanation: "You may drive on the right side only for the purpose of overtaking, and only when it is safe and legal to do so.",
    }
  ];

  const signs = [
    {
      name: "Stop Sign",
      category: "regulatory",
      meaning: "You must bring your vehicle to a complete stop and give way to all traffic.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Stop_sign.svg/1200px-Stop_sign.svg.png",
      usage: "Placed at intersections where a full stop is mandatory for safety.",
    },
    {
      name: "Give Way",
      category: "regulatory",
      meaning: "Slow down and prepare to stop to give way to traffic on the major road.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png",
      usage: "Commonly found at T-junctions or roundabouts.",
    },
    {
      name: "No Entry",
      category: "regulatory",
      meaning: "Vehicles are prohibited from entering this road.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/No_entry.svg/1200px-No_entry.svg.png",
      usage: "Used to prevent traffic from entering one-way streets in the wrong direction.",
    }
  ];

  try {
    console.log("Inserting questions...");
    for (const q of questions) {
      await db.insert(questionsTable).values(q);
    }

    console.log("Inserting signs...");
    for (const s of signs) {
      await db.insert(roadSignsTable).values(s);
    }

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
