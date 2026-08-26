// ============================================================
// JobPriceNow — SEO Pricing Guide Pages
//
// Each entry is one page at /pricing/:slug. Price ranges are NOT
// hand-typed — they're computed at render time from the same
// job-data.mjs + pricing-config.mjs numbers the actual estimator
// uses (see computePriceRange in pricing-render.mjs), so the
// content never drifts out of sync with what the calculator
// itself would tell a visitor.
//
// Adding a new page: add one object to this array. jobIds must
// match id values in lib/job-data.mjs.
// ============================================================

export const pricingPages = [
  {
    slug: "handyman-hourly-rate",
    title: "Handyman Hourly Rate: What's Fair to Charge (or Pay) in 2026",
    metaDescription: "See typical handyman hourly rates by job complexity, what actually drives the number up or down, and how to get a rate specific to your job.",
    heading: "Handyman Hourly Rate: What's Fair to Charge in 2026",
    category: "General",
    jobIds: ["floating-shelf", "toilet-minor-repair", "interior-room-painting"],
    intro:
      "There's no single \"correct\" handyman hourly rate — it depends on where you live, how specialized the work is, and how the contractor structures pricing. But there are real, consistent patterns behind the number, and understanding them helps homeowners avoid overpaying and helps handymen price with confidence instead of guessing.",
    laborNote:
      "Most independent handymen price around a baseline hourly rate and adjust up for specialized skills (electrical, plumbing) or down for simple, low-risk tasks. Many jobs are actually billed as a flat rate for the whole task rather than a pure hourly rate, once the contractor has enough experience to estimate time accurately.",
    materialsNote:
      "Hourly rate alone doesn't capture the full cost of a job — materials get added on top, usually with a modest markup to cover the trip to the store and the risk of buying the wrong part.",
    factors: [
      "Where you live — rates in high cost-of-living metro areas run well above small-town rates",
      "Licensing and insurance — a licensed, insured pro costs more than an unlicensed handyman, but carries less risk",
      "Specialized skill — electrical and plumbing work commands a premium over general carpentry or assembly",
      "Minimum trip charge — many handymen have a 1-2 hour minimum regardless of how fast the job actually goes",
      "Emergency or same-day requests — rushed jobs are often billed at a premium",
    ],
    difficultyNote:
      "Difficulty affects price less through the hourly number itself and more through how long the job takes and whether it needs a second trip for a missing part or an unexpected complication.",
    typicalConsiderations: [
      "Ask whether the quote is hourly, flat-rate, or has a minimum trip charge",
      "Clarify whether materials are included or billed separately",
      "For anything involving live electrical or gas lines, confirm licensing",
    ],
    faqs: [
      { q: "Is it cheaper to pay hourly or flat rate?", a: "It depends on the job. Flat rate protects you if the job runs long; hourly can save you money if it goes faster than expected. For well-defined jobs, flat rate is usually easier to budget around." },
      { q: "Why do quotes vary so much between handymen?", a: "Differences in experience, insurance, overhead (a company vehicle and tools cost money to maintain), and how busy that contractor currently is all show up in the quote." },
      { q: "Do handymen charge for the drive to my house?", a: "Some build it into a minimum trip charge, others charge mileage separately for jobs outside their normal service area. Always ask upfront." },
      { q: "How do I know if a rate is actually fair for my area?", a: "The best way is to compare it against a real estimate for your specific job and ZIP code, since national averages can be misleading either direction." },
    ],
    relatedSlugs: ["handyman-rates", "interior-painting-cost", "furniture-assembly-cost"],
  },

  {
    slug: "handyman-rates",
    title: "Handyman Rates by Job Type: A Practical Price Guide",
    metaDescription: "A breakdown of typical handyman rates across common jobs — mounting, repairs, plumbing, electrical, and painting — with what changes the price.",
    heading: "Handyman Rates by Job Type",
    category: "General",
    jobIds: ["tv-mounting", "door-adjustment", "switch-outlet-replacement", "fence-section-repair"],
    intro:
      "\"Handyman rates\" isn't really one number — a five-minute picture-hanging job and a multi-hour deck repair both fall under \"handyman work,\" but they price completely differently. This guide breaks rates down by the type of job rather than a single blended average, since that's what actually determines what you'll pay.",
    laborNote:
      "Quick, low-risk jobs (hanging something, tightening hardware, small adjustments) are usually priced at or near the contractor's minimum trip charge. Jobs that take real skill or carry some risk of doing damage (electrical, plumbing) price higher per hour even when the job itself is short.",
    materialsNote:
      "Some jobs need almost no materials (a door adjustment), while others are materials-heavy (a fence repair needs lumber, hardware, and often concrete). Materials-heavy jobs will have a wider price range because lumber and hardware prices fluctuate.",
    factors: [
      "Job category — electrical and plumbing carry a skill premium over general carpentry",
      "How many separate tasks are bundled into one visit (bundling usually lowers the per-task cost)",
      "Access — a job that requires a ladder, crawlspace, or attic access typically costs more",
      "Whether parts need to be sourced same-day versus already on the truck",
      "Local permit requirements for anything electrical",
    ],
    difficultyNote:
      "A good way to think about difficulty: it's not just \"how hard is this,\" it's \"how much can go wrong.\" A loose cabinet hinge has almost no downside risk. A gas line or a main electrical panel does — and that risk gets priced in.",
    typicalConsiderations: [
      "Bundling several small jobs into one visit is usually cheaper per-job than separate trips",
      "Get the ZIP code-specific range rather than relying on a national average",
      "Ask if there's a difference in price for licensed vs. unlicensed work on your specific job",
    ],
    faqs: [
      { q: "What's the cheapest kind of handyman job?", a: "Quick, low-risk tasks with no materials — hanging a picture, adjusting a door, tightening hardware — usually land at or near the minimum trip charge." },
      { q: "Why does electrical work cost more per hour than carpentry?", a: "It requires licensing in most areas, carries more liability if done wrong, and mistakes can be dangerous — all of which get priced into the rate." },
      { q: "Does bundling multiple small jobs save money?", a: "Usually yes. A contractor only has to make one trip and one setup, so bundled jobs are often cheaper per-task than booking them as separate visits." },
      { q: "How accurate are online handyman rate averages?", a: "National averages are a rough starting point at best — actual rates vary a lot by region, so a location-specific estimate is far more useful for budgeting." },
    ],
    relatedSlugs: ["handyman-hourly-rate", "tv-mounting-cost", "door-repair-cost"],
  },

  {
    slug: "drywall-repair-cost",
    title: "Drywall Repair Cost: Small Patches to Full-Wall Fixes",
    metaDescription: "What drywall repair actually costs depending on hole size, texture matching, and paint — plus what drives the price up.",
    heading: "Drywall Repair Cost",
    category: "Drywall & Walls",
    jobIds: ["drywall-small-patch", "drywall-medium-repair"],
    intro:
      "Drywall repair is one of the most requested handyman jobs, and also one of the most misunderstood on price — a coin-sized nail hole and a doorknob-sized hole through the wall are both \"drywall repair,\" but one is a 20-minute job and the other involves cutting, fitting, taping, and multiple coats of mud that need to dry between steps.",
    laborNote:
      "Small patches (nail holes, small dents) are fast — mostly just filling and sanding. Medium repairs (a few inches to a foot or so) usually need a patch piece cut to fit, tape, and at least two coats of joint compound with drying time between coats, which is why they take longer than the hole size alone would suggest.",
    materialsNote:
      "Materials are cheap for small patches — spackle and sandpaper. Medium repairs add drywall patch material, joint tape, and joint compound, plus primer and paint to blend the repair into the wall.",
    factors: [
      "Hole size — the jump from a small patch to a medium repair is less about size and more about whether a patch piece needs to be cut and fitted",
      "Texture matching — textured walls (orange peel, knockdown) take extra time and skill to blend invisibly",
      "Paint matching — if the wall color isn't known or the paint has faded, a full-wall repaint may be needed instead of a spot-paint",
      "What caused the damage — water damage may mean the drywall repair is really a symptom of a bigger issue (a leak) that should be fixed first",
      "Height and access — repairs near ceilings or above stairwells take longer and may need a ladder or scaffolding",
    ],
    difficultyNote:
      "Most drywall repair is rated easy to moderate. It becomes more difficult (and pricier) with textured walls, repairs near corners or trim, or when the drywall itself needs structural backing added before patching.",
    typicalConsiderations: [
      "Drying time between coats means even a same-day repair may need the contractor to return the next day for the final coat and paint",
      "If you see recurring damage in the same spot, ask about the root cause before just patching again",
      "Spot-painting a repair rarely matches perfectly on older, sun-faded walls",
    ],
    faqs: [
      { q: "Can drywall repair be done in one visit?", a: "Small patches often can. Medium repairs usually need multiple coats of joint compound with drying time between them, so a same-day finish isn't always realistic if a smooth, invisible result matters." },
      { q: "Will the repaired spot be visible?", a: "On a flat, plain wall, a good repair is close to invisible once painted. On textured walls or with imperfect paint matching, some visibility is normal even with skilled work." },
      { q: "Is water-damaged drywall more expensive to fix?", a: "Yes — it often means finding and fixing the leak first, then letting the area dry out completely before patching, which adds time and sometimes a follow-up visit." },
      { q: "Do I need to supply the paint?", a: "Some contractors bring general-purpose white/off-white paint; matching your exact wall color usually works best if you can provide the paint or the color code." },
    ],
    relatedSlugs: ["drywall-installation-cost", "interior-painting-cost", "trim-installation-cost"],
  },

  {
    slug: "drywall-installation-cost",
    title: "Drywall Installation Cost: New Walls, Ceilings, and Additions",
    metaDescription: "What it costs to install new drywall, what changes the price per panel, and how it differs from a drywall repair job.",
    heading: "Drywall Installation Cost",
    category: "Drywall & Walls",
    jobIds: ["drywall-medium-repair"],
    intro:
      "New drywall installation is a different job than drywall repair — instead of patching an existing wall, it's hanging full sheets, taping every seam, and finishing the entire surface. It's common after a small addition, a garage conversion, or removing a wall and needing to close up the opening.",
    laborNote:
      "Labor scales with square footage and the number of seams and corners, since every seam needs to be taped and coated multiple times. Ceilings take longer than walls because the panels are heavier to hold in place and typically need two people.",
    materialsNote:
      "Materials include the drywall sheets themselves, joint tape, joint compound, corner bead for outside corners, and screws — plus primer and paint to finish. Sheet thickness (1/2\" standard vs. 5/8\" fire-rated) affects material cost.",
    factors: [
      "Total square footage being covered",
      "Ceiling work vs. wall work — ceilings are slower and often need two people",
      "Number of corners, outlets, and openings to cut around",
      "Whether insulation needs to go in before the drywall (for exterior-facing walls)",
      "Fire-rated drywall requirements, common in garages and shared walls",
    ],
    difficultyNote:
      "New installation is generally more predictable in difficulty than repair work, since it's a clean surface rather than working around existing damage — but ceiling work and rooms with lots of corners/openings push it toward moderate-to-difficult.",
    typicalConsiderations: [
      "Get the square footage measured before requesting a quote — it's the single biggest price driver",
      "Ask whether the quote includes finishing (taping, mudding, sanding) or just hanging the sheets",
      "Painting is typically a separate line item from drywall installation",
    ],
    faqs: [
      { q: "How is drywall installation priced — per sheet or per square foot?", a: "Most contractors think in square footage since that's what determines material use and labor time, even if they reference sheet count internally." },
      { q: "Does drywall installation include painting?", a: "Usually not — installation typically includes hanging, taping, and a primer-ready finish. Painting is normally quoted separately." },
      { q: "How long does new drywall take to install?", a: "A single room can often be hung in a day, but the taping/mudding/sanding process needs multiple coats with drying time in between, so full completion usually takes several days." },
      { q: "Is ceiling drywall more expensive than wall drywall?", a: "Yes, typically — it's heavier to hold overhead, usually requires two people, and mistakes are more visible on a ceiling, all of which add labor cost." },
    ],
    relatedSlugs: ["drywall-repair-cost", "interior-painting-cost", "baseboard-installation-cost"],
  },

  {
    slug: "interior-painting-cost",
    title: "Interior Painting Cost: What a Room Actually Costs to Paint",
    metaDescription: "Interior painting costs based on room size, number of coats, prep work, and paint quality — with what makes a paint job more expensive.",
    heading: "Interior Painting Cost",
    category: "Painting",
    jobIds: ["interior-room-painting", "paint-touch-ups"],
    intro:
      "Interior painting cost swings more than most people expect based on three things: how much prep the walls need, how many coats it takes to get even coverage, and the size and shape of the room. Two \"same size\" bedrooms can price differently if one has a dark existing color that needs extra coats to cover.",
    laborNote:
      "Labor covers prep (filling small holes, taping trim, covering floors/furniture), the painting itself, and cleanup. Ceilings, trim, and cutting in around windows/doors take disproportionately more time than the open wall area.",
    materialsNote:
      "Paint is the main material cost, and quality matters — a better paint often covers in fewer coats, which can offset its higher price with lower labor. Painter's tape, drop cloths, and sundries add a modest amount on top.",
    factors: [
      "Room size and ceiling height",
      "Number of coats needed — going from a dark color to a light one often needs 2-3 coats instead of 1-2",
      "How much trim, doors, and window casing are included in the job",
      "Wall condition — heavily marked or damaged walls need prep before painting can start",
      "Paint quality/brand chosen",
    ],
    difficultyNote:
      "A single flat wall in good condition is straightforward. Difficulty rises with high ceilings (ladder work), intricate trim, or walls that need significant patching before paint will look right.",
    typicalConsiderations: [
      "Ask whether trim and doors are included or priced separately from the walls",
      "Dark-to-light color changes often need an extra coat — mention your target color upfront",
      "Furniture moving and floor protection should be clarified before the job starts",
    ],
    faqs: [
      { q: "How many coats of paint does a room typically need?", a: "Two coats is standard for a solid, even finish. Covering a dark existing color with a light new one, or painting over a repaired/patched wall, often needs a third coat." },
      { q: "Does interior painting cost include the paint itself?", a: "Most quotes include paint and materials, but it's worth confirming — and worth specifying if you have a particular paint brand or finish in mind." },
      { q: "Is ceiling painting priced differently than walls?", a: "Yes, ceilings usually cost more per square foot since they require more careful ladder work and are more visible if the finish isn't even." },
      { q: "How long does painting one room take?", a: "A typical bedroom with two coats usually takes a full day including prep, drying time between coats, and cleanup." },
    ],
    relatedSlugs: ["exterior-painting-cost", "drywall-repair-cost", "baseboard-installation-cost"],
  },

  {
    slug: "exterior-painting-cost",
    title: "Exterior Painting Cost: What Changes the Price Outside",
    metaDescription: "Exterior painting costs based on square footage, siding type, prep work, and height — and what to expect for a full exterior repaint.",
    heading: "Exterior Painting Cost",
    category: "Painting",
    jobIds: ["interior-room-painting"],
    intro:
      "Exterior painting has a wider price range than interior work because weather, siding material, and height all play a bigger role. A single-story house with smooth siding in good condition is a very different job from a two-story home with peeling paint that needs scraping and priming first.",
    laborNote:
      "Prep work often takes as long as the painting itself outside — scraping loose paint, pressure washing, caulking gaps, and priming bare spots. Skipping proper prep is the most common reason an exterior paint job fails early.",
    materialsNote:
      "Exterior paint is formulated to handle weather and UV exposure, and costs more than interior paint. Primer, caulk, and scraping/sanding supplies add to the material list, especially on older homes with paint in poor condition.",
    factors: [
      "Total exterior square footage and number of stories",
      "Current paint condition — peeling or chalking paint needs significant prep",
      "Siding material (wood, stucco, vinyl, fiber cement all take paint differently)",
      "Trim, shutters, and detail work, which take more time per square foot than flat siding",
      "Access — a two-story home may need ladders or scaffolding, which adds cost and time",
    ],
    difficultyNote:
      "Height is the biggest difficulty driver outside — second-story and above work is slower and requires more safety setup than ground-level painting.",
    typicalConsiderations: [
      "Weather windows matter — exterior paint needs the right temperature and dry conditions to cure properly",
      "Ask what prep is included; skipped prep is the most common cause of a paint job failing early",
      "Get clarity on whether trim, shutters, and doors are included in the quote",
    ],
    faqs: [
      { q: "Why is exterior painting more expensive than interior?", a: "Exterior paint and prep materials cost more, the work is more weather-dependent, and height/access (ladders, scaffolding) add both time and safety considerations." },
      { q: "How long does exterior paint last?", a: "A quality exterior paint job, properly prepped, typically lasts 7-10 years depending on climate and sun exposure, though harsh weather can shorten that." },
      { q: "Does exterior painting cost include pressure washing and prep?", a: "It should — proper prep (washing, scraping, caulking, priming bare spots) is essential for the paint to last, so confirm it's part of the quote, not an add-on." },
      { q: "Can exterior painting be done in any season?", a: "No — most exterior paints need a minimum temperature and dry conditions to cure properly, so scheduling depends on your local climate." },
    ],
    relatedSlugs: ["interior-painting-cost", "fence-repair-cost", "deck-repair-cost"],
  },

  {
    slug: "ceiling-fan-installation-cost",
    title: "Ceiling Fan Installation Cost: New Fan vs. Replacement",
    metaDescription: "What ceiling fan installation costs when replacing an existing fan versus adding one where there wasn't one before.",
    heading: "Ceiling Fan Installation Cost",
    category: "Electrical",
    jobIds: ["ceiling-fan-existing-wiring"],
    intro:
      "The single biggest factor in ceiling fan installation cost is whether wiring and a fan-rated electrical box already exist. Replacing an existing fan with a new one is usually a quick, affordable job. Installing a fan where there's only a light fixture — or nothing at all — is a much bigger job that may require an electrician.",
    laborNote:
      "With existing wiring and a proper mounting box, installation is typically fast — removing the old fan, wiring in the new one, and balancing it. Without existing wiring, running new electrical and installing a fan-rated ceiling box adds significant time and usually requires a licensed electrician.",
    materialsNote:
      "The fan itself is the main cost and varies widely by size, features (lights, remote, smart controls), and brand. A fan-rated mounting box, if needed, is a modest additional material cost.",
    factors: [
      "Whether existing wiring and a fan-rated box are already in place",
      "Ceiling height — high or vaulted ceilings need a longer downrod and more careful balancing",
      "Whether the fan includes a light kit that needs to be wired in separately",
      "Remote or smart-home control installation",
      "Fan size and weight relative to what the existing box can safely support",
    ],
    difficultyNote:
      "A straight swap with existing wiring is an easy job. Anything involving new wiring, a non-fan-rated box, or vaulted ceilings pushes this toward moderate or into licensed-electrician territory.",
    typicalConsiderations: [
      "Confirm the existing electrical box is rated for a ceiling fan's weight and vibration — a standard light box often isn't",
      "Vaulted or very high ceilings may need a specific downrod length ordered ahead of time",
      "If there's no existing fixture at all, budget for an electrician rather than a general handyman",
    ],
    faqs: [
      { q: "Can any handyman install a ceiling fan?", a: "If there's existing wiring and a fan-rated box, yes. If new wiring needs to be run, that typically requires a licensed electrician in most areas." },
      { q: "How do I know if my ceiling box is fan-rated?", a: "It's usually marked on the box itself, or a professional can check quickly — installing a fan on a non-rated box is a real safety risk since fans vibrate and are heavier than light fixtures." },
      { q: "Does installation cost include the fan itself?", a: "Usually not — most quotes are for labor only, with the fan purchased separately, though some handymen offer to source one for you." },
      { q: "How long does a ceiling fan installation take?", a: "A straightforward swap with existing wiring typically takes under two hours; new wiring or a difficult ceiling height can extend that significantly." },
    ],
    relatedSlugs: ["light-fixture-installation-cost", "tv-mounting-cost", "door-repair-cost"],
  },

  {
    slug: "light-fixture-installation-cost",
    title: "Light Fixture Installation Cost: Swaps, Pendants, and Chandeliers",
    metaDescription: "What it costs to install a new light fixture, from a simple swap to a heavier pendant or chandelier, and what changes the price.",
    heading: "Light Fixture Installation Cost",
    category: "Electrical",
    jobIds: ["light-fixture-existing-wiring"],
    intro:
      "Like ceiling fans, light fixture installation price depends heavily on whether wiring already exists. A basic fixture swap with existing wiring is one of the more affordable electrical jobs; a heavy chandelier or a fixture in a new location is a bigger project.",
    laborNote:
      "A simple swap — old fixture off, new one on — is quick if the wiring is compatible. Heavier fixtures like chandeliers need proper support (not just the electrical box) and more careful, slower installation to hang level and secure.",
    materialsNote:
      "The fixture itself varies enormously in price. Additional materials might include a heavier-duty mounting bracket for a chandelier, or wire nuts and connectors if the existing wiring needs minor adjustment.",
    factors: [
      "Existing wiring compatibility with the new fixture",
      "Fixture weight — chandeliers and large pendants need extra support beyond a standard box",
      "Ceiling height and whether a ladder or lift is needed",
      "Dimmer switch installation, if not already present",
      "Number of fixtures being installed in one visit (multiple fixtures are often cheaper per-fixture)",
    ],
    difficultyNote:
      "A basic swap is easy. Heavy fixtures, high ceilings, or fixtures requiring new electrical work move into moderate difficulty and sometimes require an electrician rather than a general handyman.",
    typicalConsiderations: [
      "Bring the new fixture's weight and mounting requirements when getting a quote",
      "Multiple fixtures installed in the same visit are usually more cost-effective per fixture than separate trips",
      "Ask about dimmer compatibility if you want dimming and the fixture doesn't already have it",
    ],
    faqs: [
      { q: "Can I install a light fixture myself?", a: "A basic swap with the power off is within reach for many DIYers, but if you're not confident working with electrical wiring, it's worth having it done professionally for safety." },
      { q: "Why do chandeliers cost more to install than a basic fixture?", a: "They're heavier and need secure mounting beyond what a standard ceiling box provides, plus more careful handling and leveling during installation." },
      { q: "Is it cheaper to install multiple light fixtures at once?", a: "Usually yes — bundling fixtures into one visit spreads the trip charge across multiple jobs, lowering the effective cost per fixture." },
      { q: "Does the quote include the fixture?", a: "Typically not — quotes are usually labor-only, with the fixture purchased separately by the homeowner." },
    ],
    relatedSlugs: ["ceiling-fan-installation-cost", "door-repair-cost", "cabinet-repair-cost"],
  },

  {
    slug: "tv-mounting-cost",
    title: "TV Mounting Cost: Wall Mounting Price by TV Size and Wall Type",
    metaDescription: "What TV mounting costs based on TV size, wall material, and whether cords need to be hidden — plus what drives the price up.",
    heading: "TV Mounting Cost",
    category: "Mounting & Installation",
    jobIds: ["tv-mounting"],
    intro:
      "TV mounting is one of the most requested handyman jobs, and one of the more predictable to price — the main variables are the wall material, TV size/weight, and whether you want cords hidden inside the wall versus left visible.",
    laborNote:
      "Mounting into wood studs is the fastest and most straightforward version of this job. Mounting into brick, tile, or concrete takes significantly longer due to specialized drilling and anchors, and mounting over a fireplace often adds difficulty due to height and the mantel.",
    materialsNote:
      "The wall mount/bracket is usually the main material cost if not already owned, sized to the TV's weight and VESA pattern. Cord concealment kits or an in-wall power outlet kit add to materials if that service is requested.",
    factors: [
      "TV size and weight — larger TVs need a heavier-duty mount and more careful anchoring",
      "Wall material — wood stud framing is easiest; brick, tile, and concrete take longer",
      "Cord concealment — hiding cords inside the wall is a separate, more involved step than mounting alone",
      "Mount type — fixed, tilting, and full-motion mounts install differently, with full-motion taking longest",
      "Height and location, such as mounting above a fireplace",
    ],
    difficultyNote:
      "A standard TV on drywall over wood studs is an easy job. Brick/tile/concrete walls, in-wall cord concealment, or mounting above a fireplace all push it toward moderate difficulty.",
    typicalConsiderations: [
      "Decide upfront whether you want cords fully hidden inside the wall or just bundled and visible",
      "Confirm stud locations aren't an issue — some walls require anchors instead of stud mounting",
      "If mounting over a fireplace, check the mantel height doesn't force an uncomfortable viewing angle",
    ],
    faqs: [
      { q: "How much more does hiding the cords cost?", a: "In-wall cord concealment is typically an added cost on top of the base mounting price since it involves fishing cords through the wall cavity and sometimes adding a power outlet behind the TV." },
      { q: "Can any wall support a TV mount?", a: "Most walls can with the right anchors, but very old or damaged drywall may need reinforcement first — worth mentioning if your walls are older." },
      { q: "Does TV mounting include the mount/bracket?", a: "Often not included — many people already own one, but a handyman can typically supply and add one to the quote if needed." },
      { q: "How long does TV mounting take?", a: "A standard mount into wood studs typically takes under an hour; concealed cords or difficult wall material can extend that to a couple hours." },
    ],
    relatedSlugs: ["light-fixture-installation-cost", "furniture-assembly-cost", "tv-mounting-cost"],
  },

  {
    slug: "door-installation-cost",
    title: "Door Installation Cost: Interior Door Replacement Pricing",
    metaDescription: "What it costs to install a new interior door, including hardware, and what makes some door installs more expensive than others.",
    heading: "Door Installation Cost",
    category: "Doors & Hardware",
    jobIds: ["door-replacement"],
    intro:
      "Installing a new interior door is more involved than it might seem — it's not just hanging a slab, it's making sure the frame is square, the door swings and latches properly, and the hardware is fitted correctly. A door that isn't installed well will stick, sag, or fail to latch within months.",
    laborNote:
      "Labor covers removing the old door (if replacing one), fitting the new door to the frame (sometimes trimming is needed), hanging it on hinges, and installing hardware. A pre-hung door (already in its own frame) is faster to install than a slab door that needs to be fitted to an existing frame.",
    materialsNote:
      "The door itself is the main material cost and varies by material (hollow-core, solid-core, solid wood) and style. Hinges, a doorknob or lever set, and shims/trim complete the install.",
    factors: [
      "Pre-hung door vs. slab-only door — pre-hung is faster to install",
      "Door material and style — solid wood doors are heavier and pricier than hollow-core",
      "Whether the existing frame is square and in good condition, or needs repair",
      "Hardware included — a basic knob vs. a higher-end lever set or lockset",
      "Trim/casing work needed to finish around the new door",
    ],
    difficultyNote:
      "A pre-hung door replacement in a square, good-condition frame is a moderate job. An out-of-square frame, a door that needs significant trimming to fit, or matching existing trim profile all add difficulty.",
    typicalConsiderations: [
      "Measure the existing door opening before shopping so the new door fits without excessive trimming",
      "Decide on hardware (knob vs. lever, finish) ahead of time so it can be included in one visit",
      "If the frame is damaged or out of square, budget for frame repair as part of the job",
    ],
    faqs: [
      { q: "What's the difference between a pre-hung and slab door?", a: "A pre-hung door comes already mounted in its own frame, ready to install into the rough opening. A slab door is just the door itself, which needs to be fitted to your existing frame — more labor-intensive." },
      { q: "Does door installation include hardware?", a: "Sometimes — it depends on the quote. Confirm whether a doorknob/lever set is included or needs to be purchased and specified separately." },
      { q: "How do I know if my door frame needs repair?", a: "Signs include a door that doesn't sit flush, visible gaps, or a frame that looks warped or damaged — a contractor can assess this during the estimate." },
      { q: "How long does installing one interior door take?", a: "A pre-hung door in a good frame typically takes a couple of hours; a slab door needing custom fitting, or frame repair, takes longer." },
    ],
    relatedSlugs: ["door-repair-cost", "trim-installation-cost", "baseboard-installation-cost"],
  },

  {
    slug: "door-repair-cost",
    title: "Door Repair Cost: Sticking, Sagging, and Hardware Fixes",
    metaDescription: "What it costs to fix a sticking, sagging, or hard-to-close door, plus hardware repairs like deadbolts and hinges.",
    heading: "Door Repair Cost",
    category: "Doors & Hardware",
    jobIds: ["door-adjustment", "deadbolt-hardware", "weatherstripping"],
    intro:
      "Most door problems — sticking, sagging, difficulty latching — are fixable without replacing the whole door, and are among the more affordable handyman jobs when caught early. The price mostly comes down to whether it's a quick adjustment or a sign of a bigger frame issue.",
    laborNote:
      "Simple adjustments (tightening hinges, planing a sticking edge, adjusting the strike plate) are quick. If the frame itself has shifted or settled — common in older homes — the fix takes longer and may need shimming or frame work.",
    materialsNote:
      "Most repairs use minimal materials — hinge screws, a bit of wood filler or planing, weatherstripping. Hardware replacement (deadbolts, handles) adds the cost of the new hardware itself.",
    factors: [
      "Whether it's a simple adjustment or a sign the frame has shifted",
      "Hardware being replaced (deadbolt, handle, hinges) and its quality level",
      "Weatherstripping condition, if the issue is drafts rather than sticking",
      "Exterior vs. interior door — exterior doors see more wear from weather and use",
      "Number of doors needing attention in one visit",
    ],
    difficultyNote:
      "Hinge tightening and basic adjustments are easy. A door that's seriously out of square with the frame, or a security-related lock repair, is more involved and sometimes needs a locksmith rather than a general handyman.",
    typicalConsiderations: [
      "A sticking door is often a quick, affordable fix if addressed early rather than left to get worse",
      "For security hardware (deadbolts, smart locks), confirm the handyman is comfortable with that specific brand/type",
      "Bundling multiple doors with the same issue into one visit is usually more efficient",
    ],
    faqs: [
      { q: "Why does my door stick in certain seasons?", a: "Wood doors and frames expand and contract with humidity, so a door that sticks in summer and clears in winter is a very common, usually minor, issue." },
      { q: "Can a sagging door be fixed without replacing it?", a: "Often yes — tightening or replacing hinges and sometimes adding a longer screw into the frame is enough to fix minor sagging without needing a new door." },
      { q: "Is deadbolt replacement a quick job?", a: "Usually, if it's a standard-size bore — a straightforward swap. Non-standard sizing or rekeying adds a bit more time." },
      { q: "When does a door repair actually need a locksmith instead of a handyman?", a: "For anything involving rekeying, high-security locks, or lock mechanisms themselves (not just the surrounding hardware), a locksmith is usually the better call." },
    ],
    relatedSlugs: ["door-installation-cost", "handyman-rates", "drywall-repair-cost"],
  },

  {
    slug: "faucet-replacement-cost",
    title: "Faucet Replacement Cost: Kitchen and Bathroom Pricing",
    metaDescription: "What it costs to replace a kitchen or bathroom faucet, including what makes some installs harder (and pricier) than others.",
    heading: "Faucet Replacement Cost",
    category: "Plumbing",
    jobIds: ["faucet-replacement"],
    intro:
      "Faucet replacement is one of the most common plumbing jobs homeowners request, and the price mostly comes down to access under the sink and whether the new faucet's configuration matches the existing hole pattern in the sink or countertop.",
    laborNote:
      "The core job is disconnecting the old supply lines, removing the old faucet, and connecting the new one — straightforward with easy access under the sink. Tight cabinets, corroded old fittings, or an unusual hole pattern all add time.",
    materialsNote:
      "The faucet itself varies enormously in price by brand and finish. Supply lines are often replaced at the same time as cheap insurance against a future leak, since it's a small added cost during a job that's already opened up.",
    factors: [
      "Whether the new faucet matches the existing hole configuration in the sink/counter",
      "Access under the sink — tight or cluttered cabinets slow the job down",
      "Condition of existing shutoff valves and supply lines — corroded fittings often need replacing too",
      "Faucet type — pull-down sprayers and touchless faucets have more components than a basic single-handle faucet",
      "Whether a garbage disposal or dishwasher connection is in the way and needs to be worked around",
    ],
    difficultyNote:
      "A straightforward swap with matching hole configuration and working shutoff valves is an easy-to-moderate job. Corroded old fittings, mismatched hole patterns, or a first-time faucet installation (no existing holes) increase difficulty.",
    typicalConsiderations: [
      "Check the new faucet's hole configuration against the existing sink before purchasing",
      "Old, corroded shutoff valves are a common surprise that adds to the job once it's opened up",
      "If the sink itself is being replaced too, that's typically a bigger, separate job",
    ],
    faqs: [
      { q: "Do I need to buy the faucet myself?", a: "Usually yes — the homeowner typically selects and purchases the faucet, with the handyman quoting labor for installation, though some can source one for you." },
      { q: "Why did my faucet replacement cost more than I expected?", a: "The most common reason is that old supply line shutoff valves turned out to be corroded or seized and needed replacing too — this is fairly common in older homes and is usually flagged once the job is underway." },
      { q: "How long does a faucet replacement take?", a: "A straightforward swap typically takes under two hours; corroded fittings or a mismatched hole pattern can extend that." },
      { q: "Can a handyman install any faucet brand?", a: "Most standard faucets are similar enough to install universally, but touchless or smart faucets with additional wiring/battery components can take extra time to set up correctly." },
    ],
    relatedSlugs: ["toilet-repair-cost", "garbage-disposal-installation-cost", "toilet-installation-cost"],
  },

  {
    slug: "garbage-disposal-installation-cost",
    title: "Garbage Disposal Installation Cost: New Install vs. Replacement",
    metaDescription: "What it costs to install or replace a garbage disposal, including what makes a first-time install pricier than a swap.",
    heading: "Garbage Disposal Installation Cost",
    category: "Plumbing",
    jobIds: ["garbage-disposal"],
    intro:
      "Replacing an existing garbage disposal is a relatively quick, predictable job. Installing one for the first time — where the sink has never had a disposal — is a bigger job since it may need new electrical wiring and plumbing configuration that doesn't currently exist.",
    laborNote:
      "A swap (same mounting system, existing wiring) mostly involves disconnecting the old unit and connecting the new one to the same mount, drain, and power. A first-time install may need a new electrical outlet under the sink and drain plumbing reconfigured.",
    materialsNote:
      "The disposal unit itself is the main cost, with a wide range based on horsepower and features. First-time installs may need additional plumbing fittings and, occasionally, a dedicated electrical outlet.",
    factors: [
      "Swap (existing mount/wiring) vs. first-time installation",
      "Disposal horsepower and features (some have noise insulation, some are septic-safe models)",
      "Whether the existing drain plumbing needs reconfiguring to fit the new unit's outlet",
      "Electrical setup — whether there's already a dedicated switch and outlet under the sink",
      "Mounting system compatibility between old and new units",
    ],
    difficultyNote:
      "A straightforward swap between compatible mounting systems is an easy-to-moderate job. First-time installation, or a mounting system mismatch requiring new plumbing fittings, is more involved.",
    typicalConsiderations: [
      "Check whether the new disposal uses the same mounting system as the old one — mismatches add plumbing work",
      "Confirm there's a dedicated switch for the disposal, or budget for adding one",
      "Septic system homes should confirm the disposal is septic-safe",
    ],
    faqs: [
      { q: "Is installing a garbage disposal for the first time much more expensive than replacing one?", a: "Often yes, since it may require new electrical work (a switch and outlet) and plumbing reconfiguration that an existing setup already has in place." },
      { q: "Do all garbage disposals fit the same mounting system?", a: "No — there are a couple of common mounting standards, and switching between them can require additional fittings, which adds a bit to the job." },
      { q: "Can a garbage disposal go on a septic system?", a: "Yes, but septic-safe models are recommended since they're designed to break food waste down more thoroughly before it reaches the tank." },
      { q: "How long does garbage disposal installation take?", a: "A straightforward swap usually takes under an hour; a first-time install with new wiring can take considerably longer." },
    ],
    relatedSlugs: ["faucet-replacement-cost", "toilet-repair-cost", "toilet-installation-cost"],
  },

  {
    slug: "toilet-installation-cost",
    title: "Toilet Installation Cost: New Toilet Replacement Pricing",
    metaDescription: "What it costs to install a new toilet, including what drives the price up, like flooring or flange condition.",
    heading: "Toilet Installation Cost",
    category: "Plumbing",
    jobIds: ["toilet-replacement"],
    intro:
      "Toilet installation is a fairly standardized job, which makes it one of the more predictably priced plumbing tasks — but the condition of the flange (the fitting that connects the toilet to the drain pipe) and the flooring underneath can add unexpected cost if they're not in good shape.",
    laborNote:
      "The core job is removing the old toilet, prepping the flange with a new wax ring, and setting and securing the new toilet. A damaged or misaligned flange, or flooring that needs to be addressed first, adds time and sometimes requires additional repair before the toilet can be set properly.",
    materialsNote:
      "The toilet itself is the main material cost, with a wide price range based on brand, flush technology, and bowl height/shape. A wax ring, bolts, and a supply line are standard small materials included in most installs.",
    factors: [
      "Condition of the existing flange — a cracked or improperly positioned flange needs repair first",
      "Flooring condition around the base — water damage here is a common surprise",
      "Toilet type — one-piece, two-piece, and comfort-height models install similarly but vary in weight and cost",
      "Whether the shutoff valve and supply line are in good working order or need replacing",
      "Bolt-down and leveling requirements if the floor isn't perfectly even",
    ],
    difficultyNote:
      "A standard installation with a good flange and solid flooring is a moderate job. A damaged flange or water-damaged subfloor increases both the difficulty and the scope, since that underlying issue needs fixing before the new toilet goes in.",
    typicalConsiderations: [
      "Ask that the flange and subfloor be checked as part of the installation, not assumed to be fine",
      "A wobbling or rocking old toilet can be a sign of subfloor damage worth investigating before it's an emergency",
      "Comfort-height and elongated bowl toilets may not fit the same footprint as the old one — check clearances",
    ],
    faqs: [
      { q: "Does toilet installation include removing the old toilet?", a: "Yes, typically — removal and disposal of the old toilet is usually included as part of a full installation job." },
      { q: "What if the subfloor is damaged under the old toilet?", a: "This is a fairly common discovery once the old toilet is removed, and it needs to be repaired before the new toilet can be properly set — worth asking about upfront as a possible added cost." },
      { q: "How long does toilet installation take?", a: "A standard installation with no underlying issues typically takes one to two hours." },
      { q: "Do I need to buy the toilet myself?", a: "Usually yes — most quotes are for installation labor, with the toilet purchased separately by the homeowner." },
    ],
    relatedSlugs: ["toilet-repair-cost", "faucet-replacement-cost", "tile-repair-cost"],
  },

  {
    slug: "toilet-repair-cost",
    title: "Toilet Repair Cost: Running, Leaking, and Flushing Issues",
    metaDescription: "What it costs to fix a running, leaking, or poorly flushing toilet, and when repair makes more sense than replacement.",
    heading: "Toilet Repair Cost",
    category: "Plumbing",
    jobIds: ["toilet-minor-repair"],
    intro:
      "Most toilet problems — running constantly, weak flush, a leak at the base — are inexpensive, quick fixes involving internal tank components or the wax ring seal, not the toilet itself. Toilet repair is one of the most affordable plumbing jobs when caught before it causes water damage.",
    laborNote:
      "Most repairs are fast: replacing a flapper, fill valve, or flush valve inside the tank takes well under an hour. A leak at the base (often a failed wax ring) requires pulling the toilet, which takes a bit longer but is still a routine job.",
    materialsNote:
      "Internal tank parts (flapper, fill valve, flush valve) are inexpensive. A wax ring for a base leak is also a low-cost part — the labor to access and reset it is the bigger portion of that particular repair.",
    factors: [
      "Type of issue — internal tank repair vs. base leak vs. clog",
      "Toilet age — very old toilets sometimes have parts that are harder to source",
      "Whether the issue has caused any water damage to the floor that also needs addressing",
      "Number of toilets needing repair in the same visit",
    ],
    difficultyNote:
      "The vast majority of toilet repairs are easy jobs. It becomes more involved only if there's underlying water damage, a cracked toilet base or tank, or a persistent clog that suggests a deeper drain line issue.",
    typicalConsiderations: [
      "A running toilet wastes a meaningful amount of water and money the longer it's left unfixed — it's usually worth addressing quickly",
      "A wobbling toilet or water pooling at the base is worth investigating promptly to avoid floor damage",
      "If the toilet is quite old, ask whether repair or replacement makes more sense long-term",
    ],
    faqs: [
      { q: "Is it worth repairing an old toilet or better to replace it?", a: "For most common issues (running, weak flush), repair is the more cost-effective choice even on an older toilet. Replacement makes more sense if the toilet is cracked, chronically clogging, or very outdated on water efficiency." },
      { q: "Why does my toilet keep running?", a: "Usually a worn flapper or fill valve that isn't sealing properly — both are inexpensive, quick fixes." },
      { q: "Is a leak at the base of the toilet serious?", a: "It can lead to floor damage if left unaddressed, so it's worth having looked at promptly even though the fix itself (often a new wax ring) is usually simple." },
      { q: "How much water does a running toilet actually waste?", a: "It can be a surprisingly large amount over weeks or months, which is why fixing it promptly usually pays for itself in the water bill savings." },
    ],
    relatedSlugs: ["toilet-installation-cost", "faucet-replacement-cost", "toilet-repair-cost"],
  },

  {
    slug: "cabinet-installation-cost",
    title: "Cabinet Installation Cost: New Cabinets and Reconfigurations",
    metaDescription: "What it costs to install new cabinets, from a single unit to a full run, and what changes the price most.",
    heading: "Cabinet Installation Cost",
    category: "Cabinets & Trim",
    jobIds: ["cabinet-hardware"],
    intro:
      "Cabinet installation cost depends heavily on scope — installing a single replacement cabinet is a modest job, while a full run of new cabinets (especially with countertop coordination) is a much bigger project that benefits from careful planning.",
    laborNote:
      "Labor covers leveling and securing each cabinet to wall studs, ensuring everything is plumb and aligned, and connecting adjacent units. Upper cabinets require careful measurement and mounting since they're load-bearing for dishes and appliances.",
    materialsNote:
      "Cabinets themselves are the dominant material cost and vary enormously by material and construction quality. Mounting hardware, shims, and fillers to handle wall irregularities are smaller additional materials.",
    factors: [
      "Number of cabinets being installed",
      "Upper vs. lower cabinets — uppers require precise, secure wall mounting",
      "Wall condition and whether studs line up conveniently with cabinet placement",
      "Whether old cabinets need to be removed first",
      "Coordination needed with countertop installation timing",
    ],
    difficultyNote:
      "A single cabinet swap is straightforward. A full kitchen run is a bigger, more coordinated job requiring precise measurement and leveling across multiple connected units — moderate to difficult depending on wall condition.",
    typicalConsiderations: [
      "Old cabinet removal is often a separate cost from new installation — confirm what's included",
      "For a full kitchen, sequencing with countertop and backsplash work matters",
      "Uneven walls or floors are common in older homes and may need shimming during install",
    ],
    faqs: [
      { q: "Does cabinet installation include removing the old cabinets?", a: "Not always — it's worth confirming, since demo and disposal of old cabinets is sometimes quoted separately." },
      { q: "How long does a full kitchen cabinet installation take?", a: "A full run typically takes multiple days depending on the kitchen size and whether walls/floors need extra leveling work." },
      { q: "Do I need to buy cabinets before getting a quote?", a: "Having cabinets selected (or at least their dimensions) helps get an accurate quote, since cabinet weight and size affect installation time." },
      { q: "Is it cheaper to install cabinets myself and just hire for the tricky parts?", a: "Some homeowners do handle simpler lower cabinets themselves and hire out upper cabinet mounting, which requires more precision — worth discussing with a contractor." },
    ],
    relatedSlugs: ["cabinet-repair-cost", "baseboard-installation-cost", "trim-installation-cost"],
  },

  {
    slug: "cabinet-repair-cost",
    title: "Cabinet Repair Cost: Hinges, Doors, and Hardware Fixes",
    metaDescription: "What it costs to fix cabinet doors, hinges, and hardware, and when repair beats full cabinet replacement.",
    heading: "Cabinet Repair Cost",
    category: "Cabinets & Trim",
    jobIds: ["cabinet-hardware", "cabinet-door-adjust"],
    intro:
      "Most cabinet issues — a door that doesn't close right, a loose hinge, worn-out hardware — are inexpensive fixes that don't require replacing the cabinet itself. Cabinet repair is one of the more affordable handyman jobs, and often makes more sense than replacement.",
    laborNote:
      "Hinge adjustment and hardware swaps are quick, often just requiring a screwdriver and some careful alignment. More involved repairs, like fixing a warped door or reinforcing a loose cabinet frame, take longer.",
    materialsNote:
      "Hardware (hinges, handles, pulls, drawer slides) is the main material cost and is generally inexpensive, though higher-end soft-close hardware costs more than basic hinges.",
    factors: [
      "Type of issue — hinge adjustment vs. hardware replacement vs. structural repair",
      "Number of cabinets needing attention in one visit",
      "Hardware quality chosen if replacing (basic vs. soft-close)",
      "Whether the cabinet box itself is damaged, not just the door or hardware",
    ],
    difficultyNote:
      "Hinge and hardware work is easy. It becomes more involved if the cabinet frame itself is damaged, warped, or was poorly installed to begin with.",
    typicalConsiderations: [
      "Bundling multiple cabinet fixes into one visit is more efficient than addressing them one at a time",
      "Updating hardware across all cabinets at once (even ones that aren't broken) is a popular, affordable refresh",
      "If a cabinet door won't close no matter how the hinge is adjusted, the frame itself may be out of square",
    ],
    faqs: [
      { q: "Is it worth repairing cabinets or should I replace them?", a: "For hinge, hardware, and minor door issues, repair is almost always the more cost-effective choice. Full replacement only makes sense if the cabinet boxes themselves are structurally damaged or you want a different style entirely." },
      { q: "Why won't my cabinet door close properly even after adjusting the hinge?", a: "This often points to the cabinet frame itself being slightly out of square, which sometimes needs more than a hinge adjustment to fully correct." },
      { q: "Can hardware be swapped without replacing the cabinet doors?", a: "Yes, in most cases — as long as the new hardware's mounting holes are compatible with (or can be adapted to) the existing holes." },
      { q: "How much does upgrading to soft-close hinges cost?", a: "It's a modest upgrade in materials cost over standard hinges, often worth it for the reduced noise and wear, especially on frequently-used cabinets." },
    ],
    relatedSlugs: ["cabinet-installation-cost", "door-repair-cost", "furniture-assembly-cost"],
  },

  {
    slug: "baseboard-installation-cost",
    title: "Baseboard Installation Cost: New and Replacement Trim",
    metaDescription: "What it costs to install new baseboard trim, including material choice and what makes corners and transitions pricier.",
    heading: "Baseboard Installation Cost",
    category: "Cabinets & Trim",
    jobIds: ["baseboard-install-repair"],
    intro:
      "Baseboard installation is priced mostly by linear footage, but the number of corners, doorways, and transitions in a room affects both material waste and labor time — a simple rectangular room installs faster than one with lots of nooks and closets.",
    laborNote:
      "Labor covers cutting each piece to length (with mitered corners for a clean look), nailing or gluing it in place, and caulking the seams for a finished appearance. More corners and transitions mean more precise cuts and more time.",
    materialsNote:
      "Material cost depends heavily on the baseboard profile and material chosen — basic MDF is the most affordable, while solid wood or more elaborate profiles cost more. Caulk, wood filler, and paint/stain to finish add to the total.",
    factors: [
      "Total linear footage of baseboard needed",
      "Number of inside/outside corners and doorway transitions",
      "Material choice — MDF, pine, or hardwood",
      "Whether old baseboard needs to be removed first",
      "Painting or staining to finish, if not pre-finished trim",
    ],
    difficultyNote:
      "A simple rectangular room is a moderate job. Rooms with many corners, closets, or transitions to different flooring take more precise measuring and cutting, increasing both time and difficulty.",
    typicalConsiderations: [
      "Removing old baseboard (and patching the wall/floor gap it leaves) is often a separate step from installing new trim",
      "Pre-finished (painted/stained) baseboard saves a finishing step compared to raw trim",
      "Matching baseboard style to existing trim elsewhere in the house is worth considering for resale value",
    ],
    faqs: [
      { q: "Is baseboard priced per room or by linear footage?", a: "Most contractors price by linear footage since that's what determines material use, though they'll usually give a room total once they've measured." },
      { q: "Does installation include painting the baseboard?", a: "Sometimes trim comes pre-finished; unfinished trim usually needs a separate painting or staining step, which may or may not be included in the quote." },
      { q: "What happens to the wall when old baseboard is removed?", a: "It's common to find small gaps, nail holes, or scuffed paint behind old baseboard that need a quick patch before new trim goes up — usually a minor addition to the job." },
      { q: "How long does baseboard installation take for one room?", a: "A typical bedroom-sized room usually takes a few hours, more for rooms with lots of corners or if old trim needs removing first." },
    ],
    relatedSlugs: ["trim-installation-cost", "interior-painting-cost", "drywall-repair-cost"],
  },

  {
    slug: "trim-installation-cost",
    title: "Trim Installation Cost: Crown Molding, Casing, and More",
    metaDescription: "What it costs to install crown molding, door/window casing, and other interior trim, and what affects the price.",
    heading: "Trim Installation Cost",
    category: "Cabinets & Trim",
    jobIds: ["baseboard-install-repair"],
    intro:
      "\"Trim\" covers a range of jobs — crown molding, window and door casing, chair rail — and pricing varies by type since some (like crown molding) require more precise angle cuts and ceiling-level work than others.",
    laborNote:
      "Crown molding is the most labor-intensive trim work, requiring precise miter cuts at corners and often coping joints for a clean fit — done at ceiling height, which slows the work further. Door and window casing is more straightforward, mostly flat cuts around a rectangular opening.",
    materialsNote:
      "Trim material ranges from affordable MDF to solid wood profiles. More elaborate crown molding profiles cost more per foot than simple casing, both in material and the added cutting time they require.",
    factors: [
      "Trim type — crown molding is more complex than door/window casing",
      "Total linear footage needed",
      "Number of corners and angle cuts required",
      "Material and profile complexity chosen",
      "Ceiling height for crown molding — higher ceilings mean more ladder work",
    ],
    difficultyNote:
      "Door and window casing is a moderate job. Crown molding, especially with detailed profiles or high ceilings, is more difficult due to the precision angle cuts and elevated work required.",
    typicalConsiderations: [
      "Crown molding typically costs more per linear foot than baseboard or casing due to the cutting complexity",
      "Matching trim profile to existing trim in the home keeps a consistent look",
      "Corners are where trim work lives or dies on quality — ask about experience with coped or mitered corners",
    ],
    faqs: [
      { q: "Why does crown molding cost more than baseboard?", a: "It requires more precise angle cuts at corners (often coped joints for a seamless look) and is installed at ceiling height, both of which add time and skill requirements." },
      { q: "Can trim be installed around existing door and window openings without removing them?", a: "Yes, casing is specifically designed to be installed around existing openings — that's its main purpose." },
      { q: "Does trim installation include painting?", a: "Often trim is installed unfinished or pre-primed and painting is a separate step, though pre-finished trim is also an option." },
      { q: "How is trim installation priced?", a: "Typically by linear footage, with crown molding priced higher per foot than baseboard or casing due to the added complexity." },
    ],
    relatedSlugs: ["baseboard-installation-cost", "door-installation-cost", "interior-painting-cost"],
  },

  {
    slug: "deck-repair-cost",
    title: "Deck Repair Cost: Board Replacement and Structural Fixes",
    metaDescription: "What it costs to repair a deck, from replacing a few boards to addressing structural or railing issues.",
    heading: "Deck Repair Cost",
    category: "Exterior",
    jobIds: ["deck-board-repair"],
    intro:
      "Deck repair covers a wide range — from swapping a few worn or splintered boards to addressing structural issues like a wobbly railing or sagging support. Catching problems early usually keeps repair costs modest; deferred maintenance tends to compound into bigger, pricier fixes.",
    laborNote:
      "Board replacement is fairly quick — removing the damaged board and fastening a new one to match. Structural repairs (railings, support posts, ledger board issues) take considerably more time and sometimes require temporary bracing while work is done.",
    materialsNote:
      "Replacement decking material should match the existing deck as closely as possible — pressure-treated lumber, cedar, and composite all have different costs and appearances. Fasteners and hardware for structural repairs add to material cost.",
    factors: [
      "Number of boards needing replacement",
      "Whether the issue is cosmetic (worn boards) or structural (railings, support)",
      "Matching new material to existing deck material and finish",
      "Deck height and accessibility underneath for structural work",
      "Whether the deck needs a broader inspection to catch related issues",
    ],
    difficultyNote:
      "Board replacement is a moderate job. Structural repairs — railings, support posts, ledger board attachment to the house — are more difficult and carry real safety implications if not done correctly.",
    typicalConsiderations: [
      "A soft or spongy spot on a deck is worth addressing before it becomes a larger structural issue",
      "Loose railings are a safety concern and shouldn't be deferred",
      "Matching weathered existing wood to new boards perfectly isn't always possible — expect some visible difference until it weathers in",
    ],
    faqs: [
      { q: "How do I know if my deck issue is cosmetic or structural?", a: "Worn or splintered boards that are still solid underfoot are usually cosmetic. Bounce, sag, wobble in railings, or soft spots are signs of a structural issue worth having assessed promptly." },
      { q: "Will replacement boards match my existing deck exactly?", a: "New wood typically looks different from weathered existing boards at first, and will blend in more over time as it weathers — composite decking can be harder to match exactly if the original product is discontinued." },
      { q: "Is a wobbly deck railing dangerous?", a: "Yes, it's worth addressing promptly rather than waiting — railings are a safety feature, not just cosmetic." },
      { q: "How often should a deck be inspected?", a: "An annual check for loose boards, railing stability, and any soft spots helps catch small issues before they become bigger, costlier repairs." },
    ],
    relatedSlugs: ["fence-repair-cost", "pressure-washing-cost", "exterior-painting-cost"],
  },

  {
    slug: "fence-repair-cost",
    title: "Fence Repair Cost: Section Replacement and Post Repair",
    metaDescription: "What it costs to repair a fence, from a single damaged section to post replacement, and what drives the price.",
    heading: "Fence Repair Cost",
    category: "Exterior",
    jobIds: ["fence-section-repair"],
    intro:
      "Fence repair is usually priced by the section or by the specific issue — a few broken pickets is a small job, while a leaning or rotted post is more involved since it often means digging out and resetting the post in concrete.",
    laborNote:
      "Picket or panel replacement is relatively quick. Post repair or replacement takes longer since it usually involves removing the old post (sometimes set in concrete), digging a new hole, and setting and leveling the new post properly before it can bear weight again.",
    materialsNote:
      "Materials depend on fence type — wood, vinyl, or chain-link all price differently. Post repairs add concrete for setting the new post, in addition to the post material itself.",
    factors: [
      "Type of repair — picket/panel replacement vs. post repair",
      "Fence material (wood, vinyl, chain-link)",
      "Number of sections or posts needing attention",
      "Whether the fence is leaning due to one bad post or a broader foundation issue",
      "Matching new material to existing weathered fence, similar to deck repair",
    ],
    difficultyNote:
      "Picket and panel repair is a moderate job. Post replacement is more involved — it requires proper concrete setting and time to cure before the fence can bear full weight again.",
    typicalConsiderations: [
      "A leaning fence is often one bad post, not a sign the whole fence needs replacing",
      "Concrete needs curing time, so post repairs aren't always a same-day complete fix",
      "Matching weathered wood exactly isn't always possible — similar to deck board matching",
    ],
    faqs: [
      { q: "Does a leaning fence mean I need a whole new fence?", a: "Not usually — a leaning fence is very often caused by one or two failing posts, which can be repaired without replacing the whole fence." },
      { q: "How long does post repair take to fully cure?", a: "Concrete typically needs a day or two to cure enough for the post to safely bear weight, so full completion may take longer than the actual labor visit." },
      { q: "Is vinyl fence repair different from wood?", a: "Yes — vinyl sections often need to be replaced as complete panels rather than patched, since the material doesn't repair the same way wood does." },
      { q: "What causes fence posts to fail?", a: "Rot at the base (common with wood posts in contact with soil), ground movement, or the original post not being set deep enough or in enough concrete are the most common causes." },
    ],
    relatedSlugs: ["deck-repair-cost", "pressure-washing-cost", "exterior-painting-cost"],
  },

  {
    slug: "pressure-washing-cost",
    title: "Pressure Washing Cost: Driveways, Decks, and Siding",
    metaDescription: "What pressure washing costs for a driveway, deck, patio, or siding, and what affects the price most.",
    heading: "Pressure Washing Cost",
    category: "Exterior",
    jobIds: ["pressure-washing-small"],
    intro:
      "Pressure washing is priced mostly by surface area and how dirty or stained the surface is — a routine annual cleaning is quicker and more affordable than restoring a surface that's built up years of grime, mildew, or algae.",
    laborNote:
      "Labor time depends on total square footage and how much scrubbing or pre-treatment stained areas need before pressure washing. Delicate surfaces (older wood, certain siding) require lower pressure and more careful technique, which can take longer than a driveway.",
    materialsNote:
      "Materials are minimal — mostly cleaning solution for tougher stains like oil, mildew, or algae. Equipment is typically owned by the contractor rather than a per-job material cost.",
    factors: [
      "Total square footage being cleaned",
      "Surface type — concrete, wood, composite decking, and siding all clean differently",
      "How much staining or buildup (oil, mildew, algae) needs pre-treatment",
      "Delicate surfaces that require lower pressure and more careful technique",
      "Accessibility of the area being cleaned",
    ],
    difficultyNote:
      "A driveway or patio is generally an easy job. Wood decking, siding, and any delicate or aged surface require more careful pressure control to avoid damage, adding difficulty.",
    typicalConsiderations: [
      "Wood surfaces need lower pressure than concrete to avoid gouging or splintering",
      "Heavy oil stains or years of buildup may need pre-treatment, adding to the job",
      "Regular pressure washing (annually or every couple years) is cheaper in the long run than letting buildup get severe",
    ],
    faqs: [
      { q: "Can pressure washing damage my deck or siding?", a: "Improper pressure or technique can damage wood or certain siding materials, which is why lower-pressure, careful technique matters for anything beyond hard concrete." },
      { q: "How often should a driveway be pressure washed?", a: "Annually is a common recommendation, though it depends on your climate and how much staining or algae growth you tend to see." },
      { q: "Does pressure washing remove oil stains?", a: "It can significantly improve most oil stains, especially with pre-treatment, though very old or deep stains may not come out completely." },
      { q: "Is pressure washing safe for painted surfaces?", a: "It can be, at the right pressure, but painted or delicate surfaces are more prone to damage than bare concrete, so technique matters more." },
    ],
    relatedSlugs: ["deck-repair-cost", "fence-repair-cost", "exterior-painting-cost"],
  },

  {
    slug: "tile-repair-cost",
    title: "Tile Repair Cost: Cracked, Loose, and Missing Tiles",
    metaDescription: "What it costs to repair cracked or loose tile, and when a small repair makes more sense than retiling the whole area.",
    heading: "Tile Repair Cost",
    category: "Flooring & Tile",
    jobIds: ["drywall-small-patch"],
    intro:
      "Fixing a handful of cracked or loose tiles is a modest job — but it comes with one real challenge: finding a matching replacement tile, especially if the original is discontinued or has weathered/faded over time.",
    laborNote:
      "Labor involves carefully removing the damaged tile without cracking neighboring ones, prepping the subfloor or wall surface, and setting and grouting the replacement. Loose (but not broken) tiles sometimes just need to be re-set with fresh adhesive.",
    materialsNote:
      "Materials are minimal for a small repair — the replacement tile itself (if you have spares or can source a match), adhesive, and grout. Grout color matching is worth double-checking since grout can fade or discolor over time.",
    factors: [
      "Number of tiles needing repair",
      "Whether a matching replacement tile is available or needs sourcing",
      "Wall tile vs. floor tile — floor tile repair often involves more subfloor consideration",
      "Grout condition around the repair area",
      "Whether the underlying cause (water damage, subfloor movement) needs addressing too",
    ],
    difficultyNote:
      "A single tile swap with a matching replacement on hand is an easy job. Sourcing a discontinued match, or floor tile repair involving subfloor issues, is more involved.",
    typicalConsiderations: [
      "Keep a few spare tiles from the original installation if possible — makes future repairs much easier",
      "Grout may not match perfectly if it's aged or faded — sometimes a broader regrout is worth considering",
      "Cracked floor tile can be a sign of subfloor movement worth investigating, not just a cosmetic issue",
    ],
    faqs: [
      { q: "What if my tile is discontinued and I can't find a match?", a: "This is a common challenge — options include sourcing a close match, using a slightly different tile as an intentional accent, or in some cases a salvage/reclaimed tile source." },
      { q: "Can a single cracked tile really be replaced without redoing the whole floor?", a: "Yes, in most cases — it just requires careful removal to avoid damaging surrounding tiles, which a skilled installer can usually manage." },
      { q: "Why is my tile cracking in the first place?", a: "Common causes include impact damage, subfloor flexing or movement, or tile that wasn't properly set with enough adhesive coverage originally." },
      { q: "Will new grout match the old grout color?", a: "Not always exactly, since grout fades and discolors with age and cleaning — worth discussing expectations before the repair." },
    ],
    relatedSlugs: ["grout-repair-cost", "drywall-repair-cost", "toilet-installation-cost"],
  },

  {
    slug: "grout-repair-cost",
    title: "Grout Repair Cost: Regrouting and Recaulking",
    metaDescription: "What it costs to repair or replace cracked, crumbling, or discolored grout in a bathroom or kitchen.",
    heading: "Grout Repair Cost",
    category: "Flooring & Tile",
    jobIds: ["tub-shower-recaulk"],
    intro:
      "Grout naturally wears, cracks, and discolors over time, especially in wet areas like showers. Regrouting is a maintenance job that's much more affordable when done before the damage lets water get behind the tile.",
    laborNote:
      "Labor involves removing old, damaged grout without chipping the tile edges, then applying and finishing new grout — a careful, somewhat time-consuming process done by hand in small sections. Caulking (at corners and transitions) is a related but separate step, often done alongside a regrout.",
    materialsNote:
      "Grout itself is inexpensive; the labor to properly remove old grout and apply new grout evenly is the bulk of the cost. Caulk for corners/transitions is also a minor material cost.",
    factors: [
      "Total area of grout lines being redone",
      "How degraded the existing grout is — heavily cracked or missing grout takes longer to remove",
      "Whether it's grout only, or grout plus caulk at corners/transitions",
      "Color matching to surrounding tile and existing grout, if only doing a partial area",
      "Whether mold/mildew has gotten into the grout, requiring extra cleaning before new grout goes in",
    ],
    difficultyNote:
      "A small, well-contained area is an easy-to-moderate job. Extensive regrouting, or grout with significant mold/mildew requiring remediation first, adds difficulty and time.",
    typicalConsiderations: [
      "Cracked or missing grout in a shower is worth fixing promptly — it's a common path for water to get behind tile and cause hidden damage",
      "Caulk (at corners, around tubs) wears differently than grout and is often replaced on its own separate schedule",
      "A full color change for grout usually means redoing the whole visible area for a consistent look, not just patching",
    ],
    faqs: [
      { q: "Why does shower grout crack or crumble?", a: "Normal wear, moisture cycling, and sometimes minor movement in the wall or floor all contribute — it's a very normal maintenance item in wet areas over time." },
      { q: "Is grout repair the same as caulk repair?", a: "No — grout is used in the tile joints themselves, while caulk is used at corners and transitions (like where tile meets a tub). They're often done together but are technically different materials and steps." },
      { q: "How urgent is fixing cracked grout in a shower?", a: "It's worth addressing reasonably soon — cracked or missing grout can let water get behind the tile, which can lead to more expensive hidden damage over time." },
      { q: "Can grout color be changed during a repair?", a: "Yes, though for a consistent look it usually makes sense to redo the full visible area rather than mixing old and new grout colors in the same space." },
    ],
    relatedSlugs: ["tile-repair-cost", "toilet-repair-cost", "faucet-replacement-cost"],
  },

  {
    slug: "furniture-assembly-cost",
    title: "Furniture Assembly Cost: Flat-Pack and Ready-to-Assemble Pricing",
    metaDescription: "What it costs to have furniture professionally assembled, from a single item to a full room of flat-pack furniture.",
    heading: "Furniture Assembly Cost",
    category: "Mounting & Installation",
    jobIds: ["furniture-assembly"],
    intro:
      "Furniture assembly is one of the most affordable and popular handyman jobs — most flat-pack furniture (the kind that ships disassembled) can be professionally assembled quickly, saving the time and frustration of doing it yourself.",
    laborNote:
      "Labor scales with the complexity and number of pieces — a simple bookshelf is quick, while a wardrobe, bed frame, or multi-piece office setup takes longer. Experienced assemblers are typically much faster than a first-time DIYer since they've handled the same or similar pieces before.",
    materialsNote:
      "There's generally no material cost beyond the furniture itself, which the homeowner supplies. Occasionally missing hardware needs to be sourced, which can add a small cost.",
    factors: [
      "Number and complexity of pieces being assembled",
      "Furniture type — a bookshelf is simpler than a bed frame or wardrobe",
      "Whether all hardware and parts are present and undamaged",
      "Whether old furniture needs to be disassembled/removed first",
      "Multiple items bundled into one visit vs. single-item requests",
    ],
    difficultyNote:
      "Most flat-pack furniture is an easy job for an experienced assembler. Larger, more complex pieces (wardrobes, modular systems) or furniture with damaged/missing hardware increase the difficulty and time.",
    typicalConsiderations: [
      "Bundling multiple pieces into one visit is more cost-effective than booking separate trips",
      "Check that all hardware is accounted for before the appointment to avoid delays",
      "Some assemblers also handle mounting (like securing a bookshelf to the wall) as part of the same visit",
    ],
    faqs: [
      { q: "Is furniture assembly cheaper for multiple items at once?", a: "Usually yes — bundling several pieces into one visit spreads the trip charge across more items, lowering the average cost per piece." },
      { q: "What if hardware is missing from the furniture box?", a: "An experienced assembler can often source a close substitute, though it may add a small amount to the job — worth checking the box is complete beforehand if possible." },
      { q: "How long does furniture assembly typically take?", a: "A simple item like a bookshelf might take 30-60 minutes; a bed frame or wardrobe can take a couple hours, and full room setups longer." },
      { q: "Can assemblers also mount furniture to the wall for tip-over safety?", a: "Many can, and it's a worthwhile add-on for tall furniture like bookshelves and dressers, especially in homes with kids." },
    ],
    relatedSlugs: ["tv-mounting-cost", "cabinet-repair-cost", "door-repair-cost"],
  },
];
