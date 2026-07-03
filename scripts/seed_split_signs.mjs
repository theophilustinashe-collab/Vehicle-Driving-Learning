import { db, roadSignsTable } from '../lib/db/src/index.ts';

async function seed() {
  console.log("🌱 Seeding separated road signs...");

  const signs = [
    // --- WARNING SIGNS (Triangle) ---
    { name: "Cattle ahead", category: "warning", meaning: "Warns of stray domestic animals crossing the road.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/South_Africa_road_sign_W301.svg/1200px-South_Africa_road_sign_W301.svg.png" },
    { name: "Animals ahead", category: "warning", meaning: "Warns of wild animals likely to cross the road.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/South_Africa_road_sign_W302.svg/1200px-South_Africa_road_sign_W302.svg.png" },
    { name: "Hump ahead", category: "warning", meaning: "Indicates a hump in the road surface.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/South_Africa_road_sign_W332.svg/1200px-South_Africa_road_sign_W332.svg.png" },
    { name: "Dip or ridge ahead", category: "warning", meaning: "Indicates a dip or ridge in the road ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/South_Africa_road_sign_W318.svg/1200px-South_Africa_road_sign_W318.svg.png" },
    { name: "Narrow bridge ahead", category: "warning", meaning: "Warns of a narrow bridge; pay attention to width restrictions.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/South_Africa_road_sign_W213.svg/1200px-South_Africa_road_sign_W213.svg.png" },
    { name: "Cross road ahead", category: "warning", meaning: "Warns of a crossroad ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/South_Africa_road_sign_W201.svg/1200px-South_Africa_road_sign_W201.svg.png" },
    { name: "Road narrows to left", category: "warning", meaning: "Warns that the road narrows from the left side.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/South_Africa_road_sign_W203.svg/1200px-South_Africa_road_sign_W203.svg.png" },
    { name: "Road narrows to right", category: "warning", meaning: "Warns that the road narrows from the right side.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/South_Africa_road_sign_W204.svg/1200px-South_Africa_road_sign_W204.svg.png" },
    { name: "Road narrows centrally", category: "warning", meaning: "Warns that the road narrows from both sides.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/South_Africa_road_sign_W202.svg/1200px-South_Africa_road_sign_W202.svg.png" },
    { name: "Pedestrians ahead", category: "warning", meaning: "Warns of people likely to be crossing the road.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Pedestrian_crossing.svg/1200px-Pedestrian_crossing.svg.png" },
    { name: "Children ahead", category: "warning", meaning: "Warns of children likely to be crossing, especially near schools.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/South_Africa_road_sign_W308.svg/1200px-South_Africa_road_sign_W308.svg.png" },
    { name: "Slippery road ahead", category: "warning", meaning: "Indicates the road surface ahead may be slippery.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/SADC_road_sign_W310.svg/1200px-SADC_road_sign_W310.svg.png" },
    { name: "Hazard ahead", category: "warning", meaning: "Indicates a hazard of a variable nature is ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Danger_sign.svg/1200px-Danger_sign.svg.png" },
    { name: "Rail/Level crossing", category: "warning", meaning: "Warns of a rail level crossing ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/South_Africa_road_sign_W311.svg/1200px-South_Africa_road_sign_W311.svg.png" },
    { name: "Congestion ahead", category: "warning", meaning: "Warns of the possibility of traffic congestion on the road ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/South_Africa_road_sign_W314.svg/1200px-South_Africa_road_sign_W314.svg.png" },
    { name: "Loose stones", category: "warning", meaning: "Warns of loose stones in the road ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/South_Africa_road_sign_W315.svg/1200px-South_Africa_road_sign_W315.svg.png" },
    { name: "Road works", category: "warning", meaning: "Warns of road works ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/South_Africa_road_sign_TW306.svg/1200px-South_Africa_road_sign_TW306.svg.png" },

    // --- REGULATORY SIGNS (Circle) ---
    { name: "Speed Limit 60", category: "regulatory", meaning: "Indicates the maximum speed limit is 60 km/h.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Speed_limit_60.svg/1200px-Speed_limit_60.svg.png" },
    { name: "Speed Limit 80", category: "regulatory", meaning: "Indicates the maximum speed limit is 80 km/h.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Speed_limit_80.svg/1200px-Speed_limit_80.svg.png" },
    { name: "Stop", category: "regulatory", meaning: "Stop, and only proceed when the road is clear on both sides.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Stop_sign.svg/1200px-Stop_sign.svg.png" },
    { name: "Give Way", category: "regulatory", meaning: "Slow down and give way to cross traffic.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png" },
    { name: "No U-Turn", category: "regulatory", meaning: "Prohibits making a 'U' turn.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/South_Africa_road_sign_R213.svg/1200px-South_Africa_road_sign_R213.svg.png" },
    { name: "About turn prohibited", category: "regulatory", meaning: "Prohibits making a full turn (about turn).", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/South_Africa_road_sign_R213.svg/1200px-South_Africa_road_sign_R213.svg.png" },
    { name: "No Parking", category: "regulatory", meaning: "Indicates you may not park your vehicle.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/South_Africa_road_sign_R216.svg/1200px-South_Africa_road_sign_R216.svg.png" },
    { name: "One Way", category: "regulatory", meaning: "Indicates a one-way street.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/South_Africa_road_sign_R103.svg/1200px-South_Africa_road_sign_R103.svg.png" },
    { name: "No Entry", category: "regulatory", meaning: "Indicates no entry.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/No_entry.svg/1200px-No_entry.svg.png" },
    { name: "Overtaking Prohibited", category: "regulatory", meaning: "Indicates overtaking is prohibited.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/South_Africa_road_sign_R214.svg/1200px-South_Africa_road_sign_R214.svg.png" },
    { name: "Width Restriction", category: "regulatory", meaning: "Indicates width limits for vehicles.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/SADC_road_sign_R203.svg/1200px-SADC_road_sign_R203.svg.png" },
    { name: "Height Restriction", category: "regulatory", meaning: "Indicates height limits for vehicles.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/South_Africa_road_sign_R204.svg/1200px-South_Africa_road_sign_R204.svg.png" },
    { name: "Weight Restriction", category: "regulatory", meaning: "Indicates weight limits for vehicles.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SADC_road_sign_R202.svg/1200px-SADC_road_sign_R202.svg.png" },

    // --- INFORMATIVE SIGNS (Rectangle) ---
    { name: "Parking", category: "informative", meaning: "Indicates parking for vehicles.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/South_Africa_road_sign_IN11.svg/1200px-South_Africa_road_sign_IN11.svg.png" },
    { name: "Lay-by", category: "informative", meaning: "Expect a 'Lay-by' ahead.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/South_Africa_road_sign_IN14.svg/1200px-South_Africa_road_sign_IN14.svg.png" },
    { name: "Hospital Sign", category: "informative", meaning: "Provides location information for a hospital.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/South_Africa_road_sign_IN1.svg/1200px-South_Africa_road_sign_IN1.svg.png" },
    { name: "Town Location Sign", category: "informative", meaning: "Provides location information for towns.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/South_Africa_road_sign_GL2.svg/1200px-South_Africa_road_sign_GL2.svg.png" },
    { name: "Bus Lane", category: "informative", meaning: "Indicates a lane reserved for buses.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/South_Africa_road_sign_R303-P.svg/1200px-South_Africa_road_sign_R303-P.svg.png" }
  ];

  try {
    console.log("Clearing all existing signs...");
    await db.delete(roadSignsTable);

    console.log(`Inserting ${signs.length} separated signs...`);
    for (const s of signs) {
      await db.insert(roadSignsTable).values(s);
    }

    console.log("✅ Successfully seeded separated road signs!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
