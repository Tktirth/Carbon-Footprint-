'use strict';

// ─── Knowledge Base ─────────────────────────────────────────────────────────
// ~30 Q&A pairs covering common sustainability topics.  Keywords are lowercased
// for matching.

const KNOWLEDGE_BASE = [
  {
    keywords: ['carbon footprint', 'what is carbon footprint', 'define carbon footprint'],
    answer:
      'A carbon footprint is the total amount of greenhouse gases (primarily CO₂) produced directly and indirectly by an individual, organisation, event, or product. It is usually measured in kilograms or tonnes of CO₂-equivalent per year.',
  },
  {
    keywords: ['co2', 'carbon dioxide', 'greenhouse gas', 'ghg'],
    answer:
      'Carbon dioxide (CO₂) is the main greenhouse gas produced by burning fossil fuels. Other greenhouse gases include methane (CH₄), nitrous oxide (N₂O), and fluorinated gases. All are often expressed in "CO₂-equivalent" for comparison.',
  },
  {
    keywords: ['global warming', 'climate change'],
    answer:
      'Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities like burning fossil fuels. The Paris Agreement aims to limit global warming to 1.5 °C above pre-industrial levels.',
  },
  {
    keywords: ['paris agreement', 'paris accord'],
    answer:
      'The Paris Agreement (2015) is an international treaty where 196 countries agreed to limit global warming to well below 2 °C, preferably 1.5 °C, by reducing greenhouse gas emissions.',
  },
  {
    keywords: ['average footprint', 'average emissions', 'per person', 'per capita'],
    answer:
      'The global average carbon footprint is roughly 4–5 tonnes of CO₂ per person per year. In the US it is about 16 tonnes, in the EU about 6 tonnes, and in India about 2 tonnes. The sustainable target is under 2 tonnes per person by 2050.',
  },
  {
    keywords: ['electric vehicle', 'ev', 'electric car'],
    answer:
      'Electric vehicles produce zero tailpipe emissions. Over their lifetime (including battery manufacturing and grid electricity), they emit 50–75% less CO₂ than petrol cars. The gap widens as grids become greener.',
  },
  {
    keywords: ['solar', 'solar panel', 'renewable energy'],
    answer:
      'Solar panels convert sunlight to electricity with zero emissions during operation. A typical rooftop system offsets 2–4 tonnes of CO₂ per year. Payback periods are 5–8 years in most regions.',
  },
  {
    keywords: ['meat', 'beef', 'diet emissions', 'food emissions'],
    answer:
      'Beef production generates ~27 kg CO₂ per kg of meat — the highest of any food. Shifting from a high-meat diet to a plant-rich one can reduce food emissions by 40–50%, saving roughly 800–1,500 kg CO₂/year.',
  },
  {
    keywords: ['vegan', 'plant-based'],
    answer:
      'A vegan diet typically produces about 1,500 kg CO₂/year — roughly 55% less than a high-meat diet (3,300 kg). Even partial shifts (e.g. Meatless Mondays) make a meaningful difference.',
  },
  {
    keywords: ['recycling', 'recycle'],
    answer:
      'Recycling aluminium saves 95% of the energy needed to make new aluminium, paper saves 60-70%, and plastics save 30-80% depending on the type. Consistent recycling can reduce a household\'s waste emissions by 30-50%.',
  },
  {
    keywords: ['fast fashion', 'clothing', 'fashion'],
    answer:
      'The fashion industry is responsible for about 10% of global carbon emissions. Each new garment produces ~14 kg CO₂. Buying second-hand, repairing, and choosing quality over quantity reduces this impact significantly.',
  },
  {
    keywords: ['flight', 'flying', 'air travel', 'airplane'],
    answer:
      'A short-haul return flight emits about 255 kg CO₂ per passenger. Long-haul flights can produce 1,000+ kg. Consider trains for trips under 800 km — they emit roughly 90% less per kilometre.',
  },
  {
    keywords: ['carbon offset', 'offset'],
    answer:
      'Carbon offsets fund projects (reforestation, renewable energy, methane capture) that reduce or remove CO₂ elsewhere. They are a useful supplement but should not replace actual emission reductions.',
  },
  {
    keywords: ['water', 'water footprint', 'water usage'],
    answer:
      'Water treatment and distribution consume energy. The carbon cost is roughly 0.3 g CO₂ per litre. Reducing hot water use has a much larger impact because heating water is energy-intensive.',
  },
  {
    keywords: ['appliance', 'energy efficiency', 'standby', 'phantom load'],
    answer:
      'Standby power ("vampire loads") accounts for 5–10% of residential electricity use. Unplugging devices or using smart power strips eliminates this waste. Energy-efficient appliances (look for Energy Star ratings) use 10–50% less electricity.',
  },
  {
    keywords: ['led', 'light bulb', 'lighting'],
    answer:
      'LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer. Switching all home lighting to LEDs can save 150–300 kg CO₂ per year.',
  },
  {
    keywords: ['compost', 'composting', 'food waste'],
    answer:
      'Composting diverts organic waste from landfill where it would produce methane (28× more potent than CO₂). Home composting can reduce household waste emissions by 15–20%.',
  },
  {
    keywords: ['tree', 'trees', 'reforestation', 'planting'],
    answer:
      'A single mature tree absorbs about 22 kg of CO₂ per year. Reforestation is a key climate strategy, but it takes decades for young trees to reach full absorption capacity. Reducing emissions remains the priority.',
  },
  {
    keywords: ['public transport', 'bus', 'train', 'metro'],
    answer:
      'Buses emit roughly 0.04 kg CO₂ per passenger-km, about 80% less than a petrol car (0.21 kg/km). Trains and metros are even cleaner, especially when electrified.',
  },
  {
    keywords: ['ac', 'air conditioning', 'cooling'],
    answer:
      'Air conditioning consumes about 1.5 kWh per hour. Setting the thermostat 2 °C higher reduces consumption by ~15%. Regular maintenance, clean filters, and proper insulation improve efficiency further.',
  },
  {
    keywords: ['online shopping', 'delivery', 'e-commerce', 'package'],
    answer:
      'Each online delivery emits ~19 kg CO₂ from packaging, warehousing, and last-mile transport. Consolidating orders, choosing slower shipping, and picking up from lockers can reduce this impact.',
  },
  {
    keywords: ['electronics', 'phone', 'laptop', 'computer', 'device'],
    answer:
      'Manufacturing a smartphone produces ~70 kg CO₂; a laptop about 300–400 kg. Extending device life by 1–2 years is the single most effective action. Repair, refurbish, and buy second-hand when possible.',
  },
  {
    keywords: ['net zero', 'carbon neutral', 'zero emissions'],
    answer:
      'Net zero means balancing the greenhouse gases emitted with an equivalent amount removed from the atmosphere. Most countries aim for net zero by 2050, which requires both deep emission cuts and carbon removal.',
  },
  {
    keywords: ['methane', 'ch4'],
    answer:
      'Methane (CH₄) is a greenhouse gas 28–80× more potent than CO₂ (depending on the timeframe). Major sources include livestock, landfills, and fossil fuel extraction. Reducing methane is a fast way to slow warming.',
  },
  {
    keywords: ['plastic', 'single-use'],
    answer:
      'Plastic production and incineration emit ~850 million tonnes CO₂/year globally. Reducing single-use plastics, carrying reusable bags/bottles, and supporting plastic-free alternatives all help.',
  },
  {
    keywords: ['insulation', 'heating', 'home energy'],
    answer:
      'Poor insulation forces heating and cooling systems to work harder. Proper wall, roof, and window insulation can reduce energy bills and emissions by 20–40%.',
  },
  {
    keywords: ['carbon tax', 'emissions trading', 'cap and trade'],
    answer:
      'Carbon pricing puts a cost on emissions to incentivise reductions. A carbon tax sets a price per tonne; cap-and-trade sets a total limit and lets companies trade allowances. Both approaches are used worldwide.',
  },
  {
    keywords: ['tip', 'tips', 'reduce', 'how to reduce', 'what can i do', 'help environment'],
    answer:
      'Top 5 things you can do: (1) Drive less or switch to an EV, (2) Eat less meat, (3) Improve home energy efficiency, (4) Fly less and offset when you do, (5) Buy less and choose second-hand. Small consistent actions add up!',
  },
  {
    keywords: ['score', 'sustainability score', 'my score'],
    answer:
      'Your sustainability score (0–100) measures how your emissions compare to the global average. A score above 60 means you are below average emissions — great job! Below 40 suggests significant room for improvement.',
  },
  {
    keywords: ['goal', 'goals', 'target', 'set goal'],
    answer:
      'Setting reduction goals helps track progress. Start with a realistic target — reducing 10–20% of your current footprint over 6 months is achievable. Use the Goals feature to monitor your journey.',
  },
];

// ─── Greeting / Fallback Patterns ───────────────────────────────────────────

const GREETING_PATTERNS = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
const THANKS_PATTERNS = ['thank', 'thanks', 'thx', 'appreciate'];
const FAREWELL_PATTERNS = ['bye', 'goodbye', 'see you', 'later'];

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Process a user message and return a response (either via Gemini AI or a rule-based fallback).
 *
 * If `userData` contains an assessment, the bot can also reference the user's
 * own emissions and scores.
 *
 * @param {string} message — user's chat input
 * @param {{ assessment?: object, scores?: object, emissions?: object } | null} userData
 * @returns {Promise<{ reply: string, suggestions: string[] }>}
 */
async function processMessage(message, userData) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build context of user emissions/scores/recommendations
      let context = '';
      if (userData) {
        context = `Here is the user's current carbon footprint context:
- Daily Emissions: ${userData.emissions?.daily || 'Unknown'} kg CO2
- Monthly Emissions: ${userData.emissions?.monthly || 'Unknown'} kg CO2
- Annual Emissions: ${userData.emissions?.annual || 'Unknown'} kg CO2
- Category Breakdown:
  * Transport: ${userData.emissions?.breakdown?.transport || 0} kg CO2/year
  * Energy: ${userData.emissions?.breakdown?.energy || 0} kg CO2/year
  * Food: ${userData.emissions?.breakdown?.food || 0} kg CO2/year
  * Consumption: ${userData.emissions?.breakdown?.consumption || 0} kg CO2/year
  * Waste: ${userData.emissions?.breakdown?.waste || 0} kg CO2/year
  * Water: ${userData.emissions?.breakdown?.water || 0} kg CO2/year
`;
        if (userData.scores) {
          const s = userData.scores;
          context += `- Sustainability Scores (out of 100, higher is more sustainable):
  * Overall Score: ${s.overall_score || 0}
  * Transport Score: ${s.transport_score || 0}
  * Energy Score: ${s.energy_score || 0}
  * Food Score: ${s.food_score || 0}
  * Consumption Score: ${s.consumption_score || 0}
  * Waste Score: ${s.waste_score || 0}
`;
        }
      }

      const prompt = `You are "EcoTrack Assistant", a helpful, friendly, and expert AI sustainability assistant.
Your goal is to answer the user's questions about carbon footprints, climate change, green living, and sustainability.
Provide concise, actionable advice. Highlight micro-actions they can take.

${context}

User Message: "${message}"

Please respond directly to the user message in a helpful, conversational manner. Avoid using placeholders or markdown titles (like # Title). Keep your response under 150 words.`;

      const result = await model.generateContent(prompt);
      const replyText = result.response.text().trim();

      // Generate suggestions using existing logic
      const suggestions = generateSuggestions((message || '').toLowerCase());

      return {
        reply: replyText,
        suggestions,
      };
    } catch (err) {
      console.error('❌ Gemini API failed, falling back to local assistant engine:', err);
    }
  }

  // Fallback to local rule-based matching
  const normalised = (message || '').toLowerCase().trim();

  if (!normalised) {
    return {
      reply: "It looks like you sent an empty message. Ask me anything about carbon footprints and sustainability!",
      suggestions: ['What is a carbon footprint?', 'How can I reduce emissions?', 'Explain my score'],
    };
  }

  // ── Greetings
  if (GREETING_PATTERNS.some((g) => normalised.startsWith(g))) {
    const name = userData?.assessment?.name || '';
    const greeting = name ? `Hello, ${name}!` : 'Hello!';
    return {
      reply: `${greeting} I'm your Carbon Footprint Assistant. Ask me about sustainability, your emissions, or how to reduce your footprint.`,
      suggestions: ['What is my carbon footprint?', 'Give me tips to reduce emissions', 'Explain my score'],
    };
  }

  // ── Thanks
  if (THANKS_PATTERNS.some((t) => normalised.includes(t))) {
    return {
      reply: "You're welcome! Every step toward sustainability counts. Let me know if you have more questions.",
      suggestions: ['How can I reduce emissions?', 'What is net zero?', 'Set a goal'],
    };
  }

  // ── Farewell
  if (FAREWELL_PATTERNS.some((f) => normalised.includes(f))) {
    return {
      reply: 'Goodbye! Remember — small actions add up to big change. See you next time! 🌍',
      suggestions: [],
    };
  }

  // ── User-specific queries (require assessment data)
  if (userData && userData.emissions) {
    // "my emissions" / "my footprint"
    if (normalised.includes('my emission') || normalised.includes('my footprint') || normalised.includes('my carbon')) {
      const e = userData.emissions;
      const breakdown = e.breakdown || {};
      const parts = Object.entries(breakdown)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${capitalise(k)}: ${v} kg`)
        .join(', ');

      return {
        reply: `Based on your latest assessment, your annual carbon footprint is ${e.annual} kg CO₂ (${e.daily} kg/day). Breakdown: ${parts}.`,
        suggestions: ['How does this compare to average?', 'How can I reduce transport emissions?', 'Explain my score'],
      };
    }

    // "my score"
    if (normalised.includes('my score') || normalised.includes('explain my score') || normalised.includes('sustainability score')) {
      if (userData.scores) {
        const s = userData.scores;
        const label = getScoreLabel(s.overall_score);
        return {
          reply: `Your overall sustainability score is ${s.overall_score}/100 (${label}). Category scores — Transport: ${s.transport_score}, Energy: ${s.energy_score}, Food: ${s.food_score}, Consumption: ${s.consumption_score}, Waste: ${s.waste_score}. Focus on your lowest-scoring category for the biggest impact.`,
          suggestions: ['How can I improve my score?', 'What is a good score?', 'Show my emissions'],
        };
      }
    }

    // "compare" / "average"
    if (normalised.includes('compare') || normalised.includes('average') || normalised.includes('how do i stack up')) {
      const annual = userData.emissions.annual || 0;
      const avgTotal = 13800; // sum of category averages
      const diff = annual - avgTotal;
      const direction = diff > 0 ? 'above' : 'below';
      return {
        reply: `The global average footprint is about ${avgTotal} kg CO₂/year. Your footprint is ${Math.abs(Math.round(diff))} kg ${direction} the average. ${diff > 0 ? 'There is room for improvement!' : 'Great work staying below average!'}`,
        suggestions: ['Give me tips', 'Show my emissions', 'What is net zero?'],
      };
    }

    // "improve" / "lower" / "reduce" (with assessment context)
    if (normalised.includes('improve') || normalised.includes('lower') || (normalised.includes('reduce') && normalised.includes('my'))) {
      const breakdown = userData.emissions.breakdown || {};
      const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      if (top) {
        return {
          reply: `Your biggest emission source is ${capitalise(top[0])} at ${top[1]} kg/year. Tackling this area first will have the greatest effect. Check the Recommendations tab for personalised actions.`,
          suggestions: [`How to reduce ${top[0]} emissions?`, 'Show recommendations', 'Set a goal'],
        };
      }
    }
  }

  // ── Knowledge base lookup
  const match = findBestMatch(normalised);
  if (match) {
    return {
      reply: match.answer,
      suggestions: generateSuggestions(normalised),
    };
  }

  // ── Fallback
  return {
    reply: "I'm not sure I understood that. I can help with questions about carbon footprints, sustainability tips, your emissions breakdown, and your sustainability score. Try asking something specific!",
    suggestions: ['What is a carbon footprint?', 'How can I reduce emissions?', 'Explain my score'],
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Find the best matching knowledge base entry by keyword overlap.
 * @param {string} normalised
 * @returns {{ answer: string } | null}
 */
function findBestMatch(normalised) {
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (normalised.includes(keyword)) {
        // Longer keyword matches are more specific → higher weight
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Require a minimum match quality (at least one keyword must have matched)
  return bestScore > 0 ? bestEntry : null;
}

/**
 * Generate follow-up suggestions based on what the user just asked.
 * @param {string} normalised
 * @returns {string[]}
 */
function generateSuggestions(normalised) {
  const pool = [
    'What is a carbon footprint?',
    'How can I reduce emissions?',
    'Tell me about electric vehicles',
    'What are carbon offsets?',
    'How does diet affect emissions?',
    'Explain my score',
    'Show my emissions',
    'What is net zero?',
    'Tips for reducing energy use',
    'How does recycling help?',
  ];

  // Remove suggestions that are too similar to the current query
  const filtered = pool.filter((s) => {
    const sNorm = s.toLowerCase();
    return !normalised.includes(sNorm.slice(0, 10));
  });

  // Return 3 random suggestions
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

/**
 * @param {string} s
 * @returns {string}
 */
function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * @param {number} score
 * @returns {string}
 */
function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Below Average';
  return 'Poor';
}

module.exports = { processMessage };
