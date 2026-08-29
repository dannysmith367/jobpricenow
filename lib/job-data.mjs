// ============================================================
// JobPriceNow — Reference Job Database
// Add new jobs by appending objects to this array. No other
// file needs to change for the reference set to grow.
// ============================================================

// Each job carries an explicit `keywords` list used for fallback matching.
// This is deliberately separate from `name` — generic words like "repair",
// "small", or "replacement" appear in many job names and must NOT be used
// as match keywords on their own, or a single word in a description would
// falsely match unrelated jobs (e.g. "repair the faucet" matching "fence
// repair" and "deck repair"). Keywords should be the distinctive noun(s).
export const referenceJobs = [
  // ---- Drywall ----
  { id: "drywall-small-patch", name: "Small drywall patch", category: "drywall", laborLow: 1, laborHigh: 2, materialLow: 10, materialHigh: 25, defaultDifficulty: "easy", riskFlags: [], keywords: ["drywall"] },
  { id: "drywall-medium-repair", name: "Medium drywall repair", category: "drywall", laborLow: 2, laborHigh: 4, materialLow: 20, materialHigh: 50, defaultDifficulty: "moderate", riskFlags: [], keywords: ["drywall"] },

  // ---- Mounting / Installation ----
  { id: "tv-mounting", name: "TV mounting", category: "mounting", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["tv", "television", "mount the tv", "mount tv"] },
  { id: "floating-shelf", name: "Floating shelf installation", category: "mounting", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 20, defaultDifficulty: "easy", riskFlags: [], keywords: ["shelf", "shelves", "shelving"] },
  { id: "picture-mirror-hanging", name: "Picture or mirror hanging", category: "mounting", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 15, defaultDifficulty: "easy", riskFlags: [], keywords: ["mirror", "picture frame", "hang a picture", "hang pictures"] },
  { id: "furniture-assembly", name: "Furniture assembly", category: "mounting", laborLow: 1, laborHigh: 3, materialLow: 0, materialHigh: 0, defaultDifficulty: "easy", riskFlags: [], keywords: ["furniture assembly", "assemble furniture", "ikea"] },

  // ---- Doors ----
  { id: "door-adjustment", name: "Interior door adjustment", category: "doors", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 10, defaultDifficulty: "easy", riskFlags: [], keywords: ["door adjust", "door sticking", "door sticks", "door won't close", "door doesn't close"] },
  { id: "door-replacement", name: "Interior door replacement", category: "doors", laborLow: 2, laborHigh: 4, materialLow: 80, materialHigh: 250, defaultDifficulty: "moderate", riskFlags: [], keywords: ["replace a door", "replace the door", "new door", "door replacement"] },
  { id: "deadbolt-hardware", name: "Deadbolt or door hardware", category: "doors", laborLow: 1, laborHigh: 2, materialLow: 20, materialHigh: 60, defaultDifficulty: "easy", riskFlags: [], keywords: ["deadbolt", "door knob", "doorknob", "door handle", "door lock"] },
  { id: "weatherstripping", name: "Weatherstripping", category: "doors", laborLow: 1, laborHigh: 2, materialLow: 15, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["weatherstrip", "weather strip", "draft under the door"] },

  // ---- Plumbing-type handyman tasks ----
  { id: "faucet-replacement", name: "Faucet replacement", category: "plumbing", laborLow: 1, laborHigh: 2, materialLow: 40, materialHigh: 120, defaultDifficulty: "moderate", riskFlags: [], keywords: ["faucet"] },
  { id: "toilet-replacement", name: "Toilet replacement", category: "plumbing", laborLow: 2, laborHigh: 3, materialLow: 100, materialHigh: 250, defaultDifficulty: "moderate", riskFlags: [], keywords: ["replace the toilet", "replace a toilet", "new toilet", "toilet replacement", "install a toilet"] },
  { id: "toilet-minor-repair", name: "Minor toilet repair", category: "plumbing", laborLow: 1, laborHigh: 2, materialLow: 10, materialHigh: 30, defaultDifficulty: "easy", riskFlags: [], keywords: ["toilet running", "toilet flush", "toilet repair", "fix the toilet", "toilet leak"] },
  { id: "garbage-disposal", name: "Garbage disposal replacement", category: "plumbing", laborLow: 1, laborHigh: 2, materialLow: 80, materialHigh: 180, defaultDifficulty: "moderate", riskFlags: [], keywords: ["garbage disposal", "disposal unit"] },
  { id: "sink-drain-repair", name: "Sink drain repair", category: "plumbing", laborLow: 1, laborHigh: 2, materialLow: 10, materialHigh: 30, defaultDifficulty: "easy", riskFlags: [], keywords: ["drain", "sink is slow", "sink clog", "clogged sink"] },
  { id: "tub-shower-recaulk", name: "Tub/shower recaulk", category: "plumbing", laborLow: 1, laborHigh: 2, materialLow: 10, materialHigh: 25, defaultDifficulty: "easy", riskFlags: [], keywords: ["caulk", "recaulk", "re-caulk"] },

  // ---- Electrical-type handyman tasks ----
  { id: "ceiling-fan-existing-wiring", name: "Ceiling fan replacement (existing wiring)", category: "electrical", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 150, defaultDifficulty: "moderate", riskFlags: [], keywords: ["ceiling fan"] },
  { id: "light-fixture-existing-wiring", name: "Light fixture replacement (existing wiring)", category: "electrical", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 100, defaultDifficulty: "easy", riskFlags: [], keywords: ["light fixture", "light fitting", "pendant light", "chandelier"] },
  { id: "switch-outlet-replacement", name: "Switch or outlet replacement", category: "electrical", laborLow: 1, laborHigh: 1, materialLow: 5, materialHigh: 20, defaultDifficulty: "easy", riskFlags: ["verify_local_licensing"], keywords: ["outlet", "light switch", "wall switch"] },
  { id: "smoke-detector", name: "Smoke detector installation", category: "electrical", laborLow: 1, laborHigh: 1, materialLow: 0, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["smoke detector", "smoke alarm", "carbon monoxide detector"] },

  // ---- Painting / finish work ----
  { id: "interior-room-painting", name: "Interior room painting", category: "painting", laborLow: 4, laborHigh: 8, materialLow: 60, materialHigh: 150, defaultDifficulty: "moderate", riskFlags: [], keywords: ["paint the room", "paint a room", "paint the walls", "painting the bedroom", "painting the living room"] },
  { id: "paint-touch-ups", name: "Paint touch-ups", category: "painting", laborLow: 2, laborHigh: 4, materialLow: 15, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["paint touch up", "touch up paint", "touch-up paint"] },
  { id: "baseboard-install-repair", name: "Baseboard installation/repair", category: "painting", laborLow: 2, laborHigh: 5, materialLow: 30, materialHigh: 90, defaultDifficulty: "moderate", riskFlags: [], keywords: ["baseboard", "base board", "trim work", "molding"] },
  { id: "cabinet-hardware", name: "Cabinet hardware installation", category: "painting", laborLow: 1, laborHigh: 3, materialLow: 20, materialHigh: 60, defaultDifficulty: "easy", riskFlags: [], keywords: ["cabinet handle", "cabinet knob", "cabinet pull", "drawer handle"] },
  { id: "cabinet-door-adjust", name: "Cabinet door adjustment/repair", category: "painting", laborLow: 1, laborHigh: 2, materialLow: 0, materialHigh: 20, defaultDifficulty: "easy", riskFlags: [], keywords: ["cabinet door", "cabinet hinge"] },

  // ---- Exterior / misc ----
  { id: "fence-section-repair", name: "Fence section repair", category: "exterior", laborLow: 2, laborHigh: 4, materialLow: 30, materialHigh: 100, defaultDifficulty: "moderate", riskFlags: [], keywords: ["fence"] },
  { id: "deck-board-repair", name: "Deck board repair", category: "exterior", laborLow: 2, laborHigh: 5, materialLow: 25, materialHigh: 90, defaultDifficulty: "moderate", riskFlags: [], keywords: ["deck board", "deck plank", "deck repair"] },
  { id: "gutter-cleaning", name: "Gutter cleaning", category: "exterior", laborLow: 1, laborHigh: 3, materialLow: 0, materialHigh: 0, defaultDifficulty: "easy", riskFlags: [], keywords: ["gutter"] },
  { id: "pressure-washing-small", name: "Small deck/patio pressure washing", category: "exterior", laborLow: 2, laborHigh: 3, materialLow: 0, materialHigh: 15, defaultDifficulty: "easy", riskFlags: [], keywords: ["pressure wash", "power wash"] },

  // ---- Flooring ----
  { id: "laminate-vinyl-plank-install", name: "Laminate/vinyl plank flooring installation", category: "flooring", laborLow: 4, laborHigh: 8, materialLow: 200, materialHigh: 600, defaultDifficulty: "moderate", riskFlags: [], keywords: ["laminate flooring", "vinyl plank", "lvp flooring", "install flooring"] },
  { id: "tile-floor-install-small", name: "Tile floor installation (small area)", category: "flooring", laborLow: 6, laborHigh: 10, materialLow: 150, materialHigh: 400, defaultDifficulty: "difficult", riskFlags: [], keywords: ["tile floor", "tile the bathroom floor", "install tile"] },
  { id: "hardwood-spot-repair", name: "Hardwood floor spot repair/refinish", category: "flooring", laborLow: 2, laborHigh: 4, materialLow: 30, materialHigh: 80, defaultDifficulty: "moderate", riskFlags: [], keywords: ["hardwood repair", "hardwood refinish", "wood floor repair", "scratched hardwood"] },
  { id: "carpet-install-room", name: "Carpet installation (per room)", category: "flooring", laborLow: 3, laborHigh: 5, materialLow: 150, materialHigh: 500, defaultDifficulty: "moderate", riskFlags: [], keywords: ["carpet installation", "install carpet", "new carpet"] },
  { id: "floor-transition-strip", name: "Floor transition strip installation", category: "flooring", laborLow: 1, laborHigh: 2, materialLow: 15, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["transition strip", "threshold strip", "floor transition"] },
  { id: "subfloor-repair-small", name: "Subfloor repair (small area)", category: "flooring", laborLow: 2, laborHigh: 4, materialLow: 40, materialHigh: 100, defaultDifficulty: "moderate", riskFlags: [], keywords: ["subfloor", "soft spot in floor", "squeaky floor repair"] },

  // ---- Landscaping / Fencing ----
  { id: "fence-gate-repair", name: "Fence gate repair/replacement", category: "landscaping", laborLow: 1, laborHigh: 2, materialLow: 40, materialHigh: 150, defaultDifficulty: "easy", riskFlags: [], keywords: ["fence gate", "gate repair", "gate hinge", "gate latch"] },
  { id: "new-fence-section", name: "New fence section installation", category: "landscaping", laborLow: 3, laborHigh: 6, materialLow: 150, materialHigh: 400, defaultDifficulty: "moderate", riskFlags: [], keywords: ["new fence", "fence installation", "install a fence", "fence section"] },
  { id: "sod-lawn-patch", name: "Sod/lawn patch installation", category: "landscaping", laborLow: 1, laborHigh: 3, materialLow: 30, materialHigh: 80, defaultDifficulty: "easy", riskFlags: [], keywords: ["sod", "lawn patch", "grass patch", "bare spot in lawn"] },
  { id: "mulch-bed-install", name: "Mulch bed installation/refresh", category: "landscaping", laborLow: 1, laborHigh: 3, materialLow: 40, materialHigh: 100, defaultDifficulty: "easy", riskFlags: [], keywords: ["mulch", "flower bed", "landscaping bed", "mulch refresh"] },
  { id: "retaining-wall-small-repair", name: "Small retaining wall repair", category: "landscaping", laborLow: 2, laborHigh: 4, materialLow: 60, materialHigh: 200, defaultDifficulty: "moderate", riskFlags: [], keywords: ["retaining wall", "landscape wall", "wall repair"] },
  { id: "sprinkler-head-repair", name: "Sprinkler/irrigation head repair", category: "landscaping", laborLow: 1, laborHigh: 2, materialLow: 10, materialHigh: 40, defaultDifficulty: "easy", riskFlags: [], keywords: ["sprinkler", "irrigation", "sprinkler head", "sprinkler repair"] },
];

// Keywords that should trigger a "professional trade may be required" warning
// regardless of which reference job (if any) matched.
export const regulatedWorkTriggers = [
  "new electrical circuit", "electrical panel", "breaker panel", "rewiring", "sub-panel",
  "gas line", "gas pipe", "run gas",
  "structural", "load bearing", "load-bearing", "remove a wall",
  "roof", "roofing", "re-roof",
  "refrigerant", "hvac", "central air install", "ductwork replacement",
  "main water line", "sewer line", "septic",
];

export function findReferenceJob(taskName) {
  const norm = taskName.toLowerCase();
  return referenceJobs.find((j) => j.keywords.some((kw) => norm.includes(kw)));
}

/**
 * Finds reference jobs whose keywords appear in the given text.
 * Used by the deterministic fallback matcher when AI is unavailable.
 * Keeps at most one match per matched keyword, so a single mentioned
 * item (e.g. "drywall") doesn't get double-counted across two similarly
 * named reference jobs that both list that keyword (e.g. "small patch"
 * + "medium repair"). Distinct keywords in the same category (e.g. "tv"
 * and "shelf", both under "mounting") are kept as separate tasks.
 */
export function matchReferenceJobs(text) {
  const norm = (text || "").toLowerCase();
  const allMatches = referenceJobs
    .map((job) => {
      const matchedKeyword = job.keywords.find((kw) => norm.includes(kw));
      return matchedKeyword ? { job, matchedKeyword } : null;
    })
    .filter(Boolean);

  const bestByKeyword = new Map();
  for (const { job, matchedKeyword } of allMatches) {
    if (!bestByKeyword.has(matchedKeyword)) {
      bestByKeyword.set(matchedKeyword, job);
    }
  }

  // Also dedupe by job id in case two different matched keywords point to the same job
  const seenIds = new Set();
  const result = [];
  for (const job of bestByKeyword.values()) {
    if (!seenIds.has(job.id)) {
      seenIds.add(job.id);
      result.push(job);
    }
  }
  return result;
}
