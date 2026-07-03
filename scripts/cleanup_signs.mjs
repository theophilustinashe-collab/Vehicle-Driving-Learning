import { db, roadSignsTable } from '../lib/db/src/index.ts';

async function cleanup() {
  const mentionedNames = [
    "Cattle/Animals ahead",
    "Hump ahead / Dip or ridge ahead",
    "Narrow bridge ahead",
    "Cross road ahead",
    "Road narrows",
    "Pedestrians/Children",
    "Slippery/Hazard",
    "Rail/Level crossing",
    "Congestion",
    "Loose stones",
    "Road works",
    "Speed Limit",
    "Stop",
    "Give Way",
    "No U-Turn / About turn prohibited",
    "No Parking",
    "One Way",
    "No Entry",
    "Overtaking Prohibited",
    "Width/Height/Weight Restriction",
    "Parking",
    "Lay-by",
    "Direction/Location",
    "Bus Lane"
  ];

  try {
    console.log("Cleaning up signs not in the curriculum list...");

    // First, let's get all signs to see which ones we're about to delete
    const allSigns = await db.select().from(roadSignsTable);
    const toDelete = allSigns.filter(s => !mentionedNames.includes(s.name));

    console.log(`Found ${toDelete.length} signs to remove.`);

    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(s => s.id);
      // Delete using IDs to be precise
      // Using a loop to avoid potential issues with large arrays in some environments
      for (const id of idsToDelete) {
        await db.execute(`DELETE FROM "road_signs" WHERE "id" = ${id}`);
      }
    }

    console.log("✅ Cleanup completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
