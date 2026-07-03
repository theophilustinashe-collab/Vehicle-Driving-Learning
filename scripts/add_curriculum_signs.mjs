import { db, roadSignsTable } from '../lib/db/src/index.ts';

async function addCurriculumSigns() {
  console.log("📚 Adding specific curriculum road signs...");

  const signs = [
    // --- WARNING SIGNS (Triangle) ---
    {
      name: "Cattle/Animals ahead",
      category: "warning",
      meaning: "Warns of stray domestic animals or wild animals crossing.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/South_Africa_road_sign_W301.svg/1200px-South_Africa_road_sign_W301.svg.png",
      usage: "Common in rural or game park areas."
    },
    {
      name: "Hump ahead / Dip or ridge ahead",
      category: "warning",
      meaning: "Indicates a hump, dip, or ridge in the road.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/South_Africa_road_sign_W318.svg/1200px-South_Africa_road_sign_W318.svg.png",
      usage: "Slow down to avoid damage to vehicle suspension."
    },
    {
      name: "Narrow bridge ahead",
      category: "warning",
      meaning: "Warns of a narrow bridge; pay attention to width restrictions.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/South_Africa_road_sign_W213.svg/1200px-South_Africa_road_sign_W213.svg.png",
      usage: "Yield to oncoming traffic if the bridge is too narrow for two vehicles."
    },
    {
      name: "Cross road ahead",
      category: "warning",
      meaning: "Warns of a crossroad ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/South_Africa_road_sign_W201.svg/1200px-South_Africa_road_sign_W201.svg.png",
      usage: "Prepare for intersecting traffic from both left and right."
    },
    {
      name: "Road narrows",
      category: "warning",
      meaning: "Warns of the road narrowing to the left, right, or centrally.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/South_Africa_road_sign_W202.svg/1200px-South_Africa_road_sign_W202.svg.png",
      usage: "Reduce speed and adjust position."
    },
    {
      name: "Pedestrians/Children",
      category: "warning",
      meaning: "Warns of the presence of children or people crossing the road.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/South_Africa_road_sign_W308.svg/1200px-South_Africa_road_sign_W308.svg.png",
      usage: "Common near schools and residential areas."
    },
    {
      name: "Slippery/Hazard",
      category: "warning",
      meaning: "Indicates the hazard ahead is of a variable nature.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/SADC_road_sign_W310.svg/1200px-SADC_road_sign_W310.svg.png",
      usage: "Drive with extreme caution."
    },
    {
      name: "Rail/Level crossing",
      category: "warning",
      meaning: "Warns of a rail level crossing ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/South_Africa_road_sign_W311.svg/1200px-South_Africa_road_sign_W311.svg.png",
      usage: "Stop, look, and listen for trains."
    },
    {
      name: "Congestion",
      category: "warning",
      meaning: "Warns of the possibility of congestion on the road ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/South_Africa_road_sign_W314.svg/1200px-South_Africa_road_sign_W314.svg.png",
      usage: "Be prepared for slow-moving or stationary traffic."
    },
    {
      name: "Loose stones",
      category: "warning",
      meaning: "Warns of loose stones in the road ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/South_Africa_road_sign_W315.svg/1200px-South_Africa_road_sign_W315.svg.png",
      usage: "Slow down to prevent stones from being thrown at other vehicles."
    },
    {
      name: "Road works",
      category: "warning",
      meaning: "Warns of road works ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/South_Africa_road_sign_TW306.svg/1200px-South_Africa_road_sign_TW306.svg.png",
      usage: "Look out for workers and machinery."
    },

    // --- REGULATORY SIGNS (Circle) ---
    {
      name: "Speed Limit",
      category: "regulatory",
      meaning: "Indicates the maximum speed limit (e.g., 60 km/h, 80 km/h).",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Speed_limit_60.svg/1200px-Speed_limit_60.svg.png",
      usage: "Do not exceed the speed shown on the sign."
    },
    {
      name: "Stop",
      category: "regulatory",
      meaning: "Stop, and only proceed when the road is clear on both sides.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Stop_sign.svg/1200px-Stop_sign.svg.png",
      usage: "A complete halt is mandatory at the stop line."
    },
    {
      name: "Give Way",
      category: "regulatory",
      meaning: "Slow down and give way to cross traffic.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png",
      usage: "Stop if necessary to let other vehicles pass."
    },
    {
      name: "No U-Turn / About turn prohibited",
      category: "regulatory",
      meaning: "Prohibits making a 'U' turn.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/South_Africa_road_sign_R213.svg/1200px-South_Africa_road_sign_R213.svg.png",
      usage: "Do not attempt to reverse direction here."
    },
    {
      name: "No Parking",
      category: "regulatory",
      meaning: "Indicates you may not park your vehicle.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/South_Africa_road_sign_R216.svg/1200px-South_Africa_road_sign_R216.svg.png",
      usage: "Stopping for short periods to load/unload may be permitted depending on local laws."
    },
    {
      name: "One Way",
      category: "regulatory",
      meaning: "Indicates a one-way street.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/South_Africa_road_sign_R103.svg/1200px-South_Africa_road_sign_R103.svg.png",
      usage: "Traffic must only travel in the direction of the arrow."
    },
    {
      name: "No Entry",
      category: "regulatory",
      meaning: "Indicates no entry.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/No_entry.svg/1200px-No_entry.svg.png",
      usage: "Do not enter the road from this end."
    },
    {
      name: "Overtaking Prohibited",
      category: "regulatory",
      meaning: "Indicates overtaking is prohibited.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/South_Africa_road_sign_R214.svg/1200px-South_Africa_road_sign_R214.svg.png",
      usage: "Stay in your lane behind the vehicle in front."
    },
    {
      name: "Width/Height/Weight Restriction",
      category: "regulatory",
      meaning: "Indicates specific limits (e.g., 2.7m width, 12t weight).",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/South_Africa_road_sign_R204.svg/1200px-South_Africa_road_sign_R204.svg.png",
      usage: "Vehicles exceeding these dimensions/weights are prohibited."
    },

    // --- INFORMATIVE SIGNS (Rectangle) ---
    {
      name: "Parking",
      category: "informative",
      meaning: "Indicates parking for vehicles (e.g., for the disabled).",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/South_Africa_road_sign_IN11.svg/1200px-South_Africa_road_sign_IN11.svg.png",
      usage: "Look for sub-signs indicating reserved spots."
    },
    {
      name: "Lay-by",
      category: "informative",
      meaning: "Expect a 'Lay-by' ahead.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/South_Africa_road_sign_IN14.svg/1200px-South_Africa_road_sign_IN14.svg.png",
      usage: "Area off the main road for short stops."
    },
    {
      name: "Direction/Location",
      category: "informative",
      meaning: "Provides directions or location information (e.g., hospital, stadium, towns).",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/South_Africa_road_sign_IN1.svg/1200px-South_Africa_road_sign_IN1.svg.png",
      usage: "Guides drivers to specific destinations."
    },
    {
      name: "Bus Lane",
      category: "informative",
      meaning: "Indicates a lane reserved for buses.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/South_Africa_road_sign_R303-P.svg/1200px-South_Africa_road_sign_R303-P.svg.png",
      usage: "Other vehicles must not use this lane during restricted hours."
    }
  ];

  try {
    for (const s of signs) {
      // We insert these as new entries to ensure exact wording matches the curriculum requirements
      await db.insert(roadSignsTable).values(s);
    }
    console.log("✅ Successfully added curriculum-specific signs!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add signs:", error);
    process.exit(1);
  }
}

addCurriculumSigns();
