import { db, roadSignsTable } from '../lib/db/src/index.ts';

async function verify() {
  console.log("🔍 Verifying road signs accuracy...");
  try {
    const signs = await db.select().from(roadSignsTable);
    console.log(`Total signs found: ${signs.length}`);

    const errors = [];
    const warningSigns = signs.filter(s => s.category === 'warning');
    const regulatorySigns = signs.filter(s => s.category === 'regulatory');
    const informativeSigns = signs.filter(s => s.category === 'informative' || s.category === 'information');

    console.log(`- Warning: ${warningSigns.length}`);
    console.log(`- Regulatory: ${regulatorySigns.length}`);
    console.log(`- Informative: ${informativeSigns.length}`);

    // Check for common mislabeling
    signs.forEach(s => {
      const name = s.name.toLowerCase();
      const cat = s.category.toLowerCase();

      // Stop/Yield/NoEntry should be regulatory
      if ((name.includes('stop') || name.includes('yield') || name.includes('give way') || name.includes('no entry')) && cat !== 'regulatory') {
        errors.push(`ERROR: "${s.name}" is ${cat} but should be regulatory.`);
      }

      // Ahead/Warning/Narrows should be warning
      if ((name.includes('ahead') || name.includes('narrows') || name.includes('hump') || name.includes('slippery')) && cat !== 'warning') {
        errors.push(`ERROR: "${s.name}" is ${cat} but should be warning.`);
      }

      // Check for empty fields
      if (!s.meaning || s.meaning.length < 5) {
        errors.push(`WARNING: "${s.name}" has missing or short meaning.`);
      }
      if (!s.imageUrl) {
        errors.push(`WARNING: "${s.name}" is missing an image.`);
      }
    });

    if (errors.length === 0) {
      console.log("✅ All signs appear to be labeled correctly based on standard curriculum rules.");
    } else {
      console.log("❌ Found the following potential issues:");
      errors.forEach(e => console.log(e));
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verify();
