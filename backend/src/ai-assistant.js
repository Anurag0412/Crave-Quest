'use strict';

const { GoogleGenAI, Type } = require('@google/genai');

const KNOWN_CUISINES = [
  'South Indian', 'North Indian', 'Punjabi', 'Indian Homestyle', 'Hyderabadi Mughlai',
  'Kashmiri & Awadhi', 'Kashmiri', 'Goan & Coastal', 'Goan', 'Street Food & Chaat', 'Street Food',
  'Thai', 'Japanese', 'Modern American', 'Persian', 'Italian', 'Mexican', 'Chinese', 'Indian',
  'Mediterranean', 'French',
];

const KNOWN_OUTLETS = [
  'Dakshin Rasoi', 'Punjab Grill', 'Punjab Grill & Tandoor', 'Copper Tiffin',
  'Copper Tiffin Thali House', 'Biryani Darbar', 'Little Saffron',
  'Little Saffron Wazwan', 'Coastal Spice', 'Coastal Spice Beach Shack',
  'Chowpatty Chaat', 'Chowpatty Chaat & Sweets', 'Tim Hortons', 'Juniper Table',
];

const KNOWN_ALLERGENS = [
  'peanuts', 'peanut', 'milk', 'dairy', 'wheat', 'gluten', 'egg', 'eggs',
  'sesame', 'fish', 'shellfish', 'soy', 'tree nuts',
];

function normalizeAllergen(name) {
  const lower = name.toLowerCase().trim();
  if (lower.startsWith('peanut')) return 'peanuts';
  if (lower === 'dairy') return 'milk';
  if (lower === 'gluten') return 'wheat';
  if (lower === 'eggs') return 'egg';
  return lower;
}

/**
 * Deterministic natural-language parser for food preferences.
 * Used when GEMINI_API_KEY is not configured or when the AI provider is unreachable.
 */
function deterministicParse(prompt) {
  const text = String(prompt || '').trim();
  const lower = text.toLowerCase();

  // 1. Cuisine identification
  let detectedCuisine = null;
  for (const cuisine of KNOWN_CUISINES) {
    const pattern = new RegExp(`\\b${cuisine.toLowerCase()}\\b`, 'i');
    if (pattern.test(lower)) {
      detectedCuisine = cuisine;
      break;
    }
  }

  // 2. Restaurant/Outlet identification
  let detectedRestaurant = null;
  for (const outlet of KNOWN_OUTLETS) {
    const pattern = new RegExp(`\\b${outlet.toLowerCase()}\\b`, 'i');
    if (pattern.test(lower)) {
      detectedRestaurant = outlet;
      break;
    }
  }

  // 3. Allergens (hard restrictions)
  const detectedAllergens = new Set();
  for (const allergen of KNOWN_ALLERGENS) {
    const pattern = new RegExp(`\\b${allergen}\\b`, 'i');
    if (pattern.test(lower)) {
      detectedAllergens.add(normalizeAllergen(allergen));
    }
  }

  // 4. Calories (check for explicit disregard vs numeric target)
  const caloriesDisregarded = /\b(calor(ies|ie)?\s*(don't|do not|aren't|are not|doesn't|does not)\s*(matter|important|count))\b/i.test(lower)
    || /\b(no\s+calorie\s+(target|restriction|limit))\b/i.test(lower)
    || /\b(ignore\s+calor(ies|ie)?)\b/i.test(lower);

  let targetCalories = null;
  if (!caloriesDisregarded) {
    const calMatch = lower.match(/\b(?:around|about|target|approx(?:imately)?|under)?\s*(\d{2,4})\s*(?:kcal|calories|cal)\b/i);
    if (calMatch) {
      targetCalories = parseInt(calMatch[1], 10);
    }
  }

  // 5. Protein preference
  const highProtein = /\b(high\s+in\s+protein|high-protein|high\s+protein|protein-rich)\b/i.test(lower);

  // 6. Price range / Budget parsing
  // Explicit range: e.g. "between ₹1,000 and ₹1,700", "between 1000 and 1700", "100 to 300"
  let minPrice = null;
  let maxPrice = null;
  let minPriceExclusive = false;
  let maxPriceExclusive = false;

  const rangeMatch = lower.match(/between\s*(?:[₹$€£]\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:and|to|-)\s*(?:[₹$€£]\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (rangeMatch) {
    minPrice = rangeMatch[1].replace(/,/g, '');
    maxPrice = rangeMatch[2].replace(/,/g, '');
    // "between X and Y" typically denotes an exclusive interval (Test 1, Test 5)
    minPriceExclusive = true;
    maxPriceExclusive = true;
  } else {
    // Check max price (e.g. "under 500", "maximum 500", "max 500")
    const maxMatch = lower.match(/\b(?:under|less\s+than|below|max(?:imum)?)\s*(?:[₹$€£]\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)\b/i);
    if (maxMatch) {
      maxPrice = maxMatch[1].replace(/,/g, '');
      maxPriceExclusive = false;
    }
  }

  // Vague budget terms like "affordable", "cheap", "inexpensive"
  const hasVagueBudget = /\b(affordable|cheap|inexpensive|budget-friendly|low-cost)\b/i.test(lower);

  // Track unspecified fields
  const unspecified = [];
  if (!detectedCuisine) unspecified.push('cuisine');
  if (!detectedRestaurant) unspecified.push('restaurant');
  if (minPrice === null && maxPrice === null) unspecified.push('price');
  if (targetCalories === null) unspecified.push('calories');
  if (detectedAllergens.size === 0) unspecified.push('allergens');

  let clarificationQuestion = null;
  if (hasVagueBudget && maxPrice === null) {
    clarificationQuestion = 'What is your preferred maximum budget or price range?';
  }

  return {
    cuisine: detectedCuisine,
    restaurant: detectedRestaurant,
    categories: [],
    hardRestrictions: {
      allergens: Array.from(detectedAllergens),
      ingredients: [],
      dietaryTags: [],
      ...(minPrice !== null ? { minPrice, minPriceExclusive } : {}),
      ...(maxPrice !== null ? { maxPrice, maxPriceExclusive } : {}),
    },
    preferences: {
      cuisineTypes: detectedCuisine ? [detectedCuisine] : [],
      categories: [],
      ...(targetCalories !== null ? { targetCalories } : {}),
      ...(highProtein ? { highProtein: true, targetProtein: 20 } : {}),
      ...(maxPrice !== null && !minPriceExclusive && !maxPriceExclusive ? { maxPrice } : {}),
    },
    caloriesDisregarded,
    unspecifiedFields: unspecified,
    clarificationQuestion,
    hasVagueBudget,
  };
}

/**
 * Parses user natural language query using Gemini 3.8 Flash if available,
 * falling back gracefully to deterministic parsing.
 */
async function parseNaturalLanguagePreferences(prompt, { apiKey = process.env.GEMINI_API_KEY } = {}) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('A non-empty prompt is required.');
  }

  const cleanPrompt = prompt.trim();
  if (cleanPrompt.length > 1000) {
    throw new Error('Prompt exceeds the 1000 character limit.');
  }

  // If no Gemini API key is configured, immediately use deterministic parser
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    const result = deterministicParse(cleanPrompt);
    return {
      success: true,
      source: 'deterministic_fallback',
      data: result,
      note: 'Parsed with deterministic language rules (AI provider not configured).',
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: cleanPrompt,
      config: {
        systemInstruction: `You are the food preference parser for CraveQuest.
Extract the user's food request into structured parameters.
CRITICAL RULES:
1. Identify explicit hard restrictions (e.g. allergies like peanuts, gluten, dairy; strict price boundaries).
2. Identify soft preferences (cuisine, dish category, high protein, desired ingredients).
3. Identify unspecified fields.
4. For vague budget words like "affordable", DO NOT invent a numeric price. Leave price unset and note that a budget clarification is needed.
5. If the user mentions "calories don't matter" or "ignore calories", set caloriesDisregarded to true and targetCalories to null.
6. Never invent a restaurant if none is mentioned.
7. Return only the JSON object matching the requested schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cuisine: { type: Type.STRING, description: 'Preferred cuisine if specified, e.g. Thai, Japanese, Persian' },
            restaurant: { type: Type.STRING, description: 'Specific restaurant/outlet name if mentioned' },
            categories: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Dish categories e.g. main, soup, dessert' },
            allergens: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Hard allergy restrictions e.g. peanuts' },
            excludedIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Ingredients to avoid' },
            minPrice: { type: Type.STRING, description: 'Numeric minimum price without currency symbols' },
            maxPrice: { type: Type.STRING, description: 'Numeric maximum price without currency symbols' },
            minPriceExclusive: { type: Type.BOOLEAN, description: 'Whether minimum price is strictly exclusive' },
            maxPriceExclusive: { type: Type.BOOLEAN, description: 'Whether maximum price is strictly exclusive' },
            targetCalories: { type: Type.NUMBER, description: 'Target calorie count in kcal' },
            caloriesDisregarded: { type: Type.BOOLEAN, description: 'True if user explicitly stated calories are not important' },
            highProtein: { type: Type.BOOLEAN, description: 'True if high protein preference requested' },
            unspecifiedFields: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of parameters not specified by the user' },
            clarificationQuestion: { type: Type.STRING, description: 'A question to ask the user if an ambiguous or vague term like affordable was used' },
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text.trim());

    // Validate and build standard CraveQuest structured preferences
    const hardRestrictions = {
      allergens: Array.isArray(parsedJson.allergens) ? parsedJson.allergens.map(normalizeAllergen) : [],
      ingredients: Array.isArray(parsedJson.excludedIngredients) ? parsedJson.excludedIngredients : [],
      dietaryTags: [],
    };
    if (parsedJson.minPrice) {
      hardRestrictions.minPrice = String(parsedJson.minPrice).replace(/[^\d.]/g, '');
      hardRestrictions.minPriceExclusive = Boolean(parsedJson.minPriceExclusive);
    }
    if (parsedJson.maxPrice) {
      hardRestrictions.maxPrice = String(parsedJson.maxPrice).replace(/[^\d.]/g, '');
      hardRestrictions.maxPriceExclusive = Boolean(parsedJson.maxPriceExclusive);
    }

    const preferences = {
      cuisineTypes: parsedJson.cuisine ? [parsedJson.cuisine] : [],
      categories: Array.isArray(parsedJson.categories) ? parsedJson.categories : [],
    };
    if (parsedJson.targetCalories && !parsedJson.caloriesDisregarded) {
      preferences.targetCalories = Number(parsedJson.targetCalories);
    }
    if (parsedJson.highProtein) {
      preferences.highProtein = true;
      preferences.targetProtein = 20;
    }

    return {
      success: true,
      source: 'gemini',
      data: {
        cuisine: parsedJson.cuisine || null,
        restaurant: parsedJson.restaurant || null,
        categories: parsedJson.categories || [],
        hardRestrictions,
        preferences,
        caloriesDisregarded: Boolean(parsedJson.caloriesDisregarded),
        unspecifiedFields: Array.isArray(parsedJson.unspecifiedFields) ? parsedJson.unspecifiedFields : [],
        clarificationQuestion: parsedJson.clarificationQuestion || null,
      },
    };
  } catch (error) {
    console.warn('[AI Assistant] Gemini API call failed or unavailable:', error.message);
    // Graceful fallback to deterministic parsing (Test 9)
    const fallback = deterministicParse(cleanPrompt);
    return {
      success: true,
      source: 'deterministic_fallback',
      data: fallback,
      note: `AI provider error (${error.message}). Falling back to deterministic rules.`,
    };
  }
}

module.exports = {
  parseNaturalLanguagePreferences,
  deterministicParse,
  normalizeAllergen,
};
