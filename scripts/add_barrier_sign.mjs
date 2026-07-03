import { db, roadSignsTable, questionsTable } from '../lib/db/src/index.ts';

async function addBarrier() {
  console.log("🛠 Adding missing Barrier sign and question...");

  const barrierSign = {
    name: "Physical Barrier ahead",
    category: "warning",
    meaning: "Warns of a physical barrier ahead on the road.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/SADC_road_sign_W310.svg/1200px-SADC_road_sign_W310.svg.png", // Placeholder, user will upload correct one
    usage: "Usually found at checkpoints or toll gates."
  };

  const barrierQuestion = {
    text: "This sign warns us of:",
    options: ["Rail level crossing ahead", "Physical barrier ahead", "A grid ahead"],
    correctAnswer: 1,
    category: "Signs",
    difficulty: "medium",
    explanation: "A triangular warning sign with a horizontal bar symbol indicates a physical barrier ahead.",
    status: "published"
  };

  try {
    console.log("Inserting sign...");
    await db.insert(roadSignsTable).values(barrierSign);

    console.log("Inserting question...");
    await db.insert(questionsTable).values(barrierQuestion);

    console.log("✅ Success! Barrier items added.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add barrier items:", error);
    process.exit(1);
  }
}

addBarrier();
