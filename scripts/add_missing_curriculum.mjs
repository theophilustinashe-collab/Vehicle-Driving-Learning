import { db, roadSignsTable, questionsTable } from '../lib/db/src/index.ts';

async function addMissing() {
  console.log("🛠 Adding specific missing signs and questions...");

  const missingSigns = [
    {
      name: "Prohibited Pedestrians and Cyclists",
      category: "regulatory",
      meaning: "Both pedestrians and cyclists are strictly prohibited from proceeding beyond this point.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/SADC_road_sign_R217-P.svg/1200px-SADC_road_sign_R217-P.svg.png",
      usage: "Commonly found on freeways or dangerous bridges."
    },
    {
      name: "No Overtaking for Heavy Goods Vehicles",
      category: "regulatory",
      meaning: "Heavy goods vehicles are prohibited from overtaking other goods vehicles.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/No_overtaking.svg/1200px-No_overtaking.svg.png",
      usage: "Used on steep inclines or narrow mountain passes."
    },
    {
      name: "Stopping Prohibited",
      category: "regulatory",
      meaning: "Vehicles are prohibited from stopping at any time on this section of the road.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/South_Africa_road_sign_R216.svg/1200px-South_Africa_road_sign_R216.svg.png",
      usage: "Used in high-traffic urban areas or near critical infrastructure."
    }
  ];

  const missingQuestions = [
    {
      text: "This sign indicates that:",
      options: ["Cyclists may not proceed beyond this", "Both cyclists and pedestrians are prohibited beyond this sign.", "Pedestrians find alternative route with their bicycles"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      explanation: "A regulatory circular sign showing both a pedestrian and a bicycle with a slash means both are prohibited.",
      status: "published"
    },
    {
      text: "This road sign means:",
      options: ["Overtaking prohibited", "Heavy goods vehicles may not overtake", "Heavy goods vehicles may not overtake another goods vehicle"],
      correctAnswer: 2,
      category: "Signs",
      difficulty: "hard",
      explanation: "In Zimbabwe, the HGV overtaking sign specifically prohibits heavy goods vehicles from passing other heavy goods vehicles.",
      status: "published"
    },
    {
      text: "This sign regulates that:",
      options: ["No stopping", "Hitch hiking allowed", "Hitch hiking prohibited"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "medium",
      explanation: "A circular red sign with a blue background and a red cross indicates 'No Stopping' (Clearway).",
      status: "published"
    },
    {
      text: "Direction and Location signs in Zimbabwe are usually:",
      options: ["Triangular", "Circular", "Rectangular"],
      correctAnswer: 2,
      category: "Signs",
      difficulty: "easy",
      explanation: "Informative signs that provide directions or identify locations are rectangular in shape.",
      status: "published"
    }
  ];

  try {
    console.log("Inserting signs...");
    for (const s of missingSigns) {
      await db.insert(roadSignsTable).values(s);
    }

    console.log("Inserting questions...");
    for (const q of missingQuestions) {
      await db.insert(questionsTable).values(q);
    }

    console.log("✅ Success! Missing items added.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add missing items:", error);
    process.exit(1);
  }
}

addMissing();
