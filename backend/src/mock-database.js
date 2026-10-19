'use strict';

const OUTLETS = [
  {
    id: '1',
    slug: 'demo-dakshin-rasoi',
    name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    address_line: '42 Indiranagar 100ft Road',
    city: 'Bengaluru',
    region: 'KA',
    postal_code: '560038',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '2',
    slug: 'demo-punjab-grill',
    name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    address_line: '12 Connaught Place Outer Circle',
    city: 'New Delhi',
    region: 'DL',
    postal_code: '110001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '3',
    slug: 'demo-copper-tiffin',
    name: 'Copper Tiffin Thali House',
    cuisine_type: 'Indian Homestyle',
    address_line: '88 Juhu Tara Road',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400049',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '4',
    slug: 'demo-biryani-darbar',
    name: 'Biryani Darbar',
    cuisine_type: 'Hyderabadi Mughlai',
    address_line: '19 Banjara Hills Road No 1',
    city: 'Hyderabad',
    region: 'TG',
    postal_code: '500034',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '5',
    slug: 'demo-little-saffron',
    name: 'Little Saffron Wazwan',
    cuisine_type: 'Kashmiri & Awadhi',
    address_line: '15 Hazratganj Heritage Lane',
    city: 'Lucknow',
    region: 'UP',
    postal_code: '226001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '6',
    slug: 'demo-coastal-spice',
    name: 'Coastal Spice Beach Shack',
    cuisine_type: 'Goan & Coastal',
    address_line: '27 Miramar Beach Promenade',
    city: 'Panaji',
    region: 'GA',
    postal_code: '403001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '7',
    slug: 'demo-chowpatty-chaat',
    name: 'Chowpatty Chaat & Sweets',
    cuisine_type: 'Street Food & Chaat',
    address_line: '5 Marine Drive Chowpatty',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400007',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '8',
    slug: 'demo-swati-snacks',
    name: 'Swati Snacks',
    cuisine_type: 'Gujarati & Maharashtrian',
    address_line: '248 Karve Road, Tardeo',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400034',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '9',
    slug: 'demo-trishna',
    name: 'Trishna Seafood & Coastal',
    cuisine_type: 'Mangalorean & Coastal',
    address_line: '7 Sai Baba Marg, Kala Ghoda, Fort',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '11',
    slug: 'demo-britannia-co',
    name: 'Britannia & Co. Restaurant',
    cuisine_type: 'Parsi & Irani',
    address_line: 'Wakefield House, 11 Sprott Rd, Ballard Estate',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '12',
    slug: 'demo-bade-miya',
    name: 'Bade Miya Kababs',
    cuisine_type: 'Mughlai & Grills',
    address_line: 'Tulloch Road, Apollo Bunder, Colaba',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400001',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
  {
    id: '13',
    slug: 'demo-gajalee',
    name: 'Gajalee Coastal Fish House',
    cuisine_type: 'Malvani Coastal',
    address_line: 'Kadam Marg, Vile Parle East',
    city: 'Mumbai',
    region: 'MH',
    postal_code: '400057',
    country_code: 'IN',
    time_zone: 'Asia/Kolkata',
    is_active: true,
  },
];

const ENTRIES = [
  // ==========================================
  // OUTLET 1: DAKSHIN RASOI (South Indian)
  // ==========================================
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '101',
    dish_name: 'Ghee Roast Masala Dosa',
    description: 'Golden-crisped fermented rice-lentil crepe brushed with desi ghee, filled with spiced potato and onion bhaji.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Recipe Card',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '180.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Fermented batter', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'urad dal', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Fermented batter', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Inner bhaji', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'onion', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Inner bhaji', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Pure clarified butter', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'mustard seed', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Tadka seasoning', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Tadka seasoning', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'ghee', ingredientVerificationStatus: 'verified', evidenceNote: 'Clarified milk butter', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'mustard', verificationStatus: 'verified', ingredientName: 'mustard seed', ingredientVerificationStatus: 'verified', evidenceNote: 'Mustard seeds in potato tadka', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Pure vegetarian preparation', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Rice and lentil only', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 420, protein: 9, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '102',
    dish_name: 'Steamed Mysore Mallige Idli',
    description: 'Pillow-soft jasmine rice cakes steamed in traditional cloth molds, served with piping hot sambar and fresh coconut chutney.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Recipe Card',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '110.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'urad dal', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'coconut', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'In chutney', verifiedAt: null },
      { name: 'sambar dal', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Toor dal', verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Zero animal products', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Plant-based', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure rice and lentils', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy used', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 240, protein: 11, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '103',
    dish_name: 'Chettinad Pepper Paneer Curry',
    description: 'Fresh artisanal cottage cheese cubes tossed in freshly stone-ground Tellicherry black pepper, curry leaves, and star anise gravy.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Head Chef Audit',
    ingredient_data_checked_at: '2026-01-11T12:00:00Z',
    price: '320.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'paneer', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Whole milk curd', verifiedAt: null },
      { name: 'black pepper', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'tomato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'onion', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'paneer', ingredientVerificationStatus: 'verified', evidenceNote: 'Cow milk cottage cheese', verifiedAt: '2026-01-11T12:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian cottage cheese', verifiedAt: '2026-01-11T12:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'No wheat thickeners', verifiedAt: '2026-01-11T12:00:00Z' },
    ],
    nutrition: { calories: 480, protein: 24, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '104',
    dish_name: 'Crispy Medu Vada Duo',
    description: 'Golden crispy lentil donuts seasoned with whole black peppercorns, fresh ginger, and green chilies, served with coconut dip.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Spec',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '110.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'urad dal', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'black pepper', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'ginger', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Fried in vegetable oil', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Lentil dish', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'No flour added', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 310, protein: 9, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '105',
    dish_name: 'Curd Rice with Pomegranate Tadka',
    description: 'Slow-tempered creamy yogurt rice with mustard seeds, ginger, curry leaves, and fresh pomegranate arils.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Spec',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '140.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Fresh curd', verifiedAt: null },
      { name: 'mustard seed', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'pomegranate', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Dairy curd', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian curd rice', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure rice and yogurt', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 330, protein: 8, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '1',
    outlet_slug: 'demo-dakshin-rasoi',
    outlet_name: 'Dakshin Rasoi',
    cuisine_type: 'South Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '101',
    menu_name: 'Dakshin Heritage All-Day Menu',
    service_period: 'all_day',
    dish_id: '106',
    dish_name: 'South Indian Degree Filter Coffee',
    description: 'Strong chicory coffee decoction frothed with hot boiled whole milk in a traditional brass davarah tumbler.',
    category: 'beverage',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Beverage Bar',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '60.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'coffee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'milk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Whole buffalo milk', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'milk', ingredientVerificationStatus: 'verified', evidenceNote: 'Dairy milk', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Contains milk', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Naturally gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 110, protein: 4, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 2: PUNJAB GRILL & TANDOOR (North Indian)
  // ==========================================
  {
    outlet_id: '2',
    outlet_slug: 'demo-punjab-grill',
    outlet_name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '201',
    menu_name: 'Pind & Tandoor Grand Menu',
    service_period: 'dinner',
    dish_id: '201',
    dish_name: 'Dal Makhani Bukhara Style',
    description: '24-hour slow-cooked whole black urad lentils and kidney beans simmered in churned white butter, vine-ripened tomatoes, and velvety cream.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Chef Recipe Book',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '340.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'black lentils', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'kidney beans', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'cream', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'tomato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'fenugreek', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Dairy butter and cream', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian lentil dal', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'No flour added', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 510, protein: 19, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '2',
    outlet_slug: 'demo-punjab-grill',
    outlet_name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '201',
    menu_name: 'Pind & Tandoor Grand Menu',
    service_period: 'dinner',
    dish_id: '202',
    dish_name: 'Paneer Tikka Angara',
    description: 'Charcoal-grilled cottage cheese slabs marinated in hung curd, Kashmiri red chili, and carom seeds, served with mint chutney.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Chef Recipe Book',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '360.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'paneer', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Hung curd marinade', verifiedAt: null },
      { name: 'bell pepper', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'onion', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'paneer', ingredientVerificationStatus: 'verified', evidenceNote: 'Cottage cheese and curd', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian tandoor', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten-free marinade', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 440, protein: 26, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '2',
    outlet_slug: 'demo-punjab-grill',
    outlet_name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '201',
    menu_name: 'Pind & Tandoor Grand Menu',
    service_period: 'dinner',
    dish_id: '203',
    dish_name: 'Amritsari Kulcha with Pindi Chole',
    description: 'Crisp layered clay-oven leavened bread stuffed with spiced mashed potatoes and onions, served with dark spiced chickpea curry.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Audit',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '260.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'wheat flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Maida dough', verifiedAt: null },
      { name: 'chickpea', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Chole', verifiedAt: null },
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Kulcha stuffing', verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Layered butter', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'wheat', verificationStatus: 'verified', ingredientName: 'wheat flour', ingredientVerificationStatus: 'verified', evidenceNote: 'Refined wheat dough', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Butter glaze', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian combo', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 590, protein: 17, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '2',
    outlet_slug: 'demo-punjab-grill',
    outlet_name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '201',
    menu_name: 'Pind & Tandoor Grand Menu',
    service_period: 'dinner',
    dish_id: '204',
    dish_name: 'Garlic Butter Naan Basket',
    description: 'Clay-oven slapped sourdough flatbreads brushed generously with garlic, butter, and freshly chopped cilantro.',
    category: 'breads',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Bakery Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '110.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'wheat flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'garlic', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'wheat', verificationStatus: 'verified', ingredientName: 'wheat flour', ingredientVerificationStatus: 'verified', evidenceNote: 'Wheat flour', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Butter', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian flatbread', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 290, protein: 7, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '2',
    outlet_slug: 'demo-punjab-grill',
    outlet_name: 'Punjab Grill & Tandoor',
    cuisine_type: 'North Indian',
    time_zone: 'Asia/Kolkata',
    menu_id: '201',
    menu_name: 'Pind & Tandoor Grand Menu',
    service_period: 'dinner',
    dish_id: '205',
    dish_name: 'Kesar Pista Badam Kulfi',
    description: 'Slow-condensed milk kulfi infused with royal saffron strands, crushed green pistachios, and roasted slivered almonds.',
    category: 'dessert',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Dessert Pantry',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '150.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'milk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Whole rabdi milk', verifiedAt: null },
      { name: 'saffron', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'pistachio', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'almond', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'milk', ingredientVerificationStatus: 'verified', evidenceNote: 'Milk', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'tree nuts', verificationStatus: 'verified', ingredientName: 'pistachio', ingredientVerificationStatus: 'verified', evidenceNote: 'Pistachios and almonds', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Contains dairy', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure milk and nuts', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 250, protein: 6, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 3: COPPER TIFFIN THALI HOUSE (Indian Homestyle)
  // ==========================================
  {
    outlet_id: '3',
    outlet_slug: 'demo-copper-tiffin',
    outlet_name: 'Copper Tiffin Thali House',
    cuisine_type: 'Indian Homestyle',
    time_zone: 'Asia/Kolkata',
    menu_id: '301',
    menu_name: 'Maharaja Homestyle Lunch Feast',
    service_period: 'lunch',
    dish_id: '301',
    dish_name: 'Royal Kathiyawadi Thali',
    description: 'Grand regional thali featuring baingan bharta, gujarati sweet kadhi, bajra rotla with white butter, dal, rice, and jaggery.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Thali Pantry',
    ingredient_data_checked_at: '2026-01-12T11:00:00Z',
    price: '450.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'eggplant', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'buttermilk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'millet flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Bajra', verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Desi makhan', verifiedAt: null },
      { name: 'jaggery', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Butter and buttermilk', verifiedAt: '2026-01-12T11:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Pure vegetarian thali', verifiedAt: '2026-01-12T11:00:00Z' },
    ],
    nutrition: { calories: 710, protein: 21, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '3',
    outlet_slug: 'demo-copper-tiffin',
    outlet_name: 'Copper Tiffin Thali House',
    cuisine_type: 'Indian Homestyle',
    time_zone: 'Asia/Kolkata',
    menu_id: '301',
    menu_name: 'Maharaja Homestyle Lunch Feast',
    service_period: 'lunch',
    dish_id: '302',
    dish_name: 'Lemon Peanut Rice with Mango Pickle',
    description: 'Fragrant turmeric rice tempered with crunchy roasted peanuts, mustard seeds, curry leaves, and freshly squeezed lemon juice.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Recipe Card',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '180.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'peanuts', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Roasted groundnuts', verifiedAt: null },
      { name: 'mustard seed', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'lemon', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'peanuts', verificationStatus: 'verified', ingredientName: 'peanuts', ingredientVerificationStatus: 'verified', evidenceNote: 'Roasted whole peanuts', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Plant-based', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 380, protein: 10, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '3',
    outlet_slug: 'demo-copper-tiffin',
    outlet_name: 'Copper Tiffin Thali House',
    cuisine_type: 'Indian Homestyle',
    time_zone: 'Asia/Kolkata',
    menu_id: '301',
    menu_name: 'Maharaja Homestyle Lunch Feast',
    service_period: 'lunch',
    dish_id: '303',
    dish_name: 'Steamed Khaman Dhokla',
    description: 'Airy, melt-in-the-mouth steamed gram flour sponge tempered with mustard seeds, sesame, fresh coriander, and sweet-tart syrup.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Snack Station',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '120.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'chickpea flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Besan', verifiedAt: null },
      { name: 'mustard seed', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'sesame', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'White til seeds', verifiedAt: null },
      { name: 'green chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'sesame', verificationStatus: 'verified', ingredientName: 'sesame', ingredientVerificationStatus: 'verified', evidenceNote: 'Sesame seed tadka', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Plant-based recipe', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Pure veg', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gram flour only', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 210, protein: 8, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 4: BIRYANI DARBAR (Hyderabadi Mughlai)
  // ==========================================
  {
    outlet_id: '4',
    outlet_slug: 'demo-biryani-darbar',
    outlet_name: 'Biryani Darbar',
    cuisine_type: 'Hyderabadi Mughlai',
    time_zone: 'Asia/Kolkata',
    menu_id: '401',
    menu_name: 'Nizami Dastarkhwan',
    service_period: 'all_day',
    dish_id: '401',
    dish_name: 'Hyderabadi Dum Murgh Biryani',
    description: 'Long-grain basmati rice and marinated tender chicken pieces slow-sealed in handi with saffron, fried onions, and whole spices.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Bawarchi Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '420.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'chicken', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Aged basmati', verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'saffron', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'fried onion', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'ghee', ingredientVerificationStatus: 'verified', evidenceNote: 'Clarified butter and curd', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Naturally gluten free rice and spices', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 680, protein: 36, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '4',
    outlet_slug: 'demo-biryani-darbar',
    outlet_name: 'Biryani Darbar',
    cuisine_type: 'Hyderabadi Mughlai',
    time_zone: 'Asia/Kolkata',
    menu_id: '401',
    menu_name: 'Nizami Dastarkhwan',
    service_period: 'all_day',
    dish_id: '402',
    dish_name: 'Nizami Subz Dum Biryani',
    description: 'Fragrant basmati rice layered with paneer, baby carrots, beans, and cauliflower steeped in kewra water, mint, and green cardamom.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Bawarchi Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '340.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Basmati rice', verifiedAt: null },
      { name: 'paneer', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'carrot', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'cauliflower', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'saffron', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'paneer', ingredientVerificationStatus: 'verified', evidenceNote: 'Paneer and ghee', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetable biryani', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Rice and vegetable dish', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 510, protein: 17, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '4',
    outlet_slug: 'demo-biryani-darbar',
    outlet_name: 'Biryani Darbar',
    cuisine_type: 'Hyderabadi Mughlai',
    time_zone: 'Asia/Kolkata',
    menu_id: '401',
    menu_name: 'Nizami Dastarkhwan',
    service_period: 'all_day',
    dish_id: '403',
    dish_name: 'Mirchi Ka Salan',
    description: 'Traditional Hyderabadi delicacy of charred green peppers simmered in roasted peanuts, sesame, tamarind, and fresh coconut paste.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Spec',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '180.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'green chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'peanuts', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Peanut paste', verifiedAt: null },
      { name: 'sesame', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Sesame paste', verifiedAt: null },
      { name: 'coconut', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'tamarind', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'peanuts', verificationStatus: 'verified', ingredientName: 'peanuts', ingredientVerificationStatus: 'verified', evidenceNote: 'Peanut paste gravy', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'sesame', verificationStatus: 'verified', ingredientName: 'sesame', ingredientVerificationStatus: 'verified', evidenceNote: 'Roasted sesame paste', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Plant-based gravy', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian curry', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'No flour', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy products', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 320, protein: 7, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 5: LITTLE SAFFRON WAZWAN (Kashmiri & Awadhi)
  // ==========================================
  {
    outlet_id: '5',
    outlet_slug: 'demo-little-saffron',
    outlet_name: 'Little Saffron Wazwan',
    cuisine_type: 'Kashmiri & Awadhi',
    time_zone: 'Asia/Kolkata',
    menu_id: '501',
    menu_name: 'Royal Wazwan Evening Spread',
    service_period: 'dinner',
    dish_id: '501',
    dish_name: 'Kashmiri Dum Aloo Wazwan',
    description: 'Tender baby potatoes par-boiled, pricked, and slow-fried, simmered in fragrant Kashmiri chili and fennel yogurt gravy.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Master Wazwan Chef',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '320.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'fennel', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Saunf powder', verifiedAt: null },
      { name: 'ginger', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Dry soonth', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Yogurt curry base', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian curry', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure spices and potato', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 410, protein: 8, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '5',
    outlet_slug: 'demo-little-saffron',
    outlet_name: 'Little Saffron Wazwan',
    cuisine_type: 'Kashmiri & Awadhi',
    time_zone: 'Asia/Kolkata',
    menu_id: '501',
    menu_name: 'Royal Wazwan Evening Spread',
    service_period: 'dinner',
    dish_id: '502',
    dish_name: 'Nadru Yakhni Lotus Stem',
    description: 'Crunchy Kashmiri lotus stem coins simmered in aromatic curd gravy tempered with dried mountain mint and cloves.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Master Wazwan Chef',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '360.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'lotus stem', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Nadru', verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'mint', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Curd yakhni base', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian yakhni', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 340, protein: 10, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '5',
    outlet_slug: 'demo-little-saffron',
    outlet_name: 'Little Saffron Wazwan',
    cuisine_type: 'Kashmiri & Awadhi',
    time_zone: 'Asia/Kolkata',
    menu_id: '501',
    menu_name: 'Royal Wazwan Evening Spread',
    service_period: 'dinner',
    dish_id: '503',
    dish_name: 'Zafraani Saffron Pulao',
    description: 'Fragrant basmati rice gently cooked with pure Pampore saffron strands, whole green cardamom, and crispy caramelized shallots.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Master Wazwan Chef',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '280.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Basmati', verifiedAt: null },
      { name: 'saffron', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Pampore saffron', verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'ghee', ingredientVerificationStatus: 'verified', evidenceNote: 'Ghee', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian rice', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 380, protein: 8, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 6: COASTAL SPICE BEACH SHACK (Goan & Coastal)
  // ==========================================
  {
    outlet_id: '6',
    outlet_slug: 'demo-coastal-spice',
    outlet_name: 'Coastal Spice Beach Shack',
    cuisine_type: 'Goan & Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '601',
    menu_name: 'Konkan & Malabar Tides',
    service_period: 'all_day',
    dish_id: '601',
    dish_name: 'Goan Coconut & Raw Mango Curry',
    description: 'Tart fresh green mango slices simmered in rich hand-pressed coconut milk, dried Byadgi red chilies, and fresh curry leaves.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Coastal Kitchen Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '380.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'coconut milk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'raw mango', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'red chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'curry leaf', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Coconut based', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian curry', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 410, protein: 9, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '6',
    outlet_slug: 'demo-coastal-spice',
    outlet_name: 'Coastal Spice Beach Shack',
    cuisine_type: 'Goan & Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '601',
    menu_name: 'Konkan & Malabar Tides',
    service_period: 'all_day',
    dish_id: '602',
    dish_name: 'Appam with Malabar Vegetable Stew',
    description: 'Lacy fermented rice appams served with mild coconut-cardamom vegetable stew loaded with carrots, green beans, and potatoes.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Coastal Kitchen Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '320.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Appam batter', verifiedAt: null },
      { name: 'coconut milk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Stew broth', verifiedAt: null },
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'carrot', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Plant-based stew and appams', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetable stew', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure fermented rice', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'Coconut milk only', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 370, protein: 11, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '6',
    outlet_slug: 'demo-coastal-spice',
    outlet_name: 'Coastal Spice Beach Shack',
    cuisine_type: 'Goan & Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '601',
    menu_name: 'Konkan & Malabar Tides',
    service_period: 'all_day',
    dish_id: '603',
    dish_name: 'Chilled Kokum Sol Kadhi',
    description: 'Refreshing coastal digestive beverage crafted with sun-dried kokum rind extract, fresh coconut milk, green chili, and minced garlic.',
    category: 'beverage',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Beverage Bar',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '90.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'kokum', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'coconut milk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'garlic', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Coconut kokum drink', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian drink', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Naturally gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No milk', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 80, protein: 2, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },

  // ==========================================
  // OUTLET 7: CHOWPATTY CHAAT & SWEETS (Street Food)
  // ==========================================
  {
    outlet_id: '7',
    outlet_slug: 'demo-chowpatty-chaat',
    outlet_name: 'Chowpatty Chaat & Sweets',
    cuisine_type: 'Street Food & Chaat',
    time_zone: 'Asia/Kolkata',
    menu_id: '701',
    menu_name: 'Bambaiyya Street Cart Specials',
    service_period: 'all_day',
    dish_id: '701',
    dish_name: 'Mumbai Butter Pav Bhaji',
    description: 'Sizzling spiced mashed potato, tomato, and pea gravy tossed on heavy tawa, served with warm butter-toasted soft pav buns.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Street Kitchen',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '190.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'tomato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Amul butter', verifiedAt: null },
      { name: 'wheat bread', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Pav buns', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'wheat', verificationStatus: 'verified', ingredientName: 'wheat bread', ingredientVerificationStatus: 'verified', evidenceNote: 'Wheat pav bread', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Table butter', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian street food', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 560, protein: 14, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '7',
    outlet_slug: 'demo-chowpatty-chaat',
    outlet_name: 'Chowpatty Chaat & Sweets',
    cuisine_type: 'Street Food & Chaat',
    time_zone: 'Asia/Kolkata',
    menu_id: '701',
    menu_name: 'Bambaiyya Street Cart Specials',
    service_period: 'all_day',
    dish_id: '702',
    dish_name: 'Delhi Style Dahi Papdi Chaat',
    description: 'Crisp savory wheat crackers layered with diced boiled potatoes, chilled sweetened yogurt, zesty tamarind chutney, and fine sev.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Street Kitchen',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '140.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'wheat flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Crispy papdi', verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Sweet dahi', verifiedAt: null },
      { name: 'potato', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'tamarind', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'wheat', verificationStatus: 'verified', ingredientName: 'wheat flour', ingredientVerificationStatus: 'verified', evidenceNote: 'Papdi crackers', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Curd topping', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian chaat', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 340, protein: 9, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '7',
    outlet_slug: 'demo-chowpatty-chaat',
    outlet_name: 'Chowpatty Chaat & Sweets',
    cuisine_type: 'Street Food & Chaat',
    time_zone: 'Asia/Kolkata',
    menu_id: '701',
    menu_name: 'Bambaiyya Street Cart Specials',
    service_period: 'all_day',
    dish_id: '703',
    dish_name: 'Kesar Alphonso Mango Lassi',
    description: 'Thick, creamy slow-churned sweet curd whipped with golden Ratnagiri Alphonso mango pulp and freshly ground cardamom.',
    category: 'beverage',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Beverage Bar',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '130.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Thick curd', verifiedAt: null },
      { name: 'mango', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Alphonso pulp', verifiedAt: null },
      { name: 'cardamom', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Cultured milk yogurt', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Dairy based', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gluten free', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 280, protein: 9, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  // ==========================================
  // OUTLET 8: SWATI SNACKS (Mumbai - Gujarati & Maharashtrian)
  // ==========================================
  {
    outlet_id: '8',
    outlet_slug: 'demo-swati-snacks',
    outlet_name: 'Swati Snacks',
    cuisine_type: 'Gujarati & Maharashtrian',
    time_zone: 'Asia/Kolkata',
    menu_id: '801',
    menu_name: 'Heritage Traditional All-Day Menu',
    service_period: 'all_day',
    dish_id: '801',
    dish_name: 'Panki Chutney in Banana Leaf',
    description: 'Thin delicate rice flour batter seasoned with cumin, turmeric and green chili, steamed between fresh banana leaves, served with mint coriander chutney.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Recipe Card',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '240.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Ground rice', verifiedAt: null },
      { name: 'green chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Fresh chili', verifiedAt: null },
      { name: 'turmeric', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'coriander', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Pure vegetarian', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified', evidenceNote: 'Plant based', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Rice flour only', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 210, protein: 5, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '8',
    outlet_slug: 'demo-swati-snacks',
    outlet_name: 'Swati Snacks',
    cuisine_type: 'Gujarati & Maharashtrian',
    time_zone: 'Asia/Kolkata',
    menu_id: '801',
    menu_name: 'Heritage Traditional All-Day Menu',
    service_period: 'all_day',
    dish_id: '802',
    dish_name: 'Baked Masala Khichdi',
    description: 'Slow-baked spiced moong dal and rice casserole layered with vegetables, topped with curd and crispy gram flour sev.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Kitchen Recipe Card',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '310.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'moong dal', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Clarified butter', verifiedAt: null },
      { name: 'yogurt', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Cultured milk', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'yogurt', ingredientVerificationStatus: 'verified', evidenceNote: 'Curd & ghee', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-vegetarian', label: 'Vegetarian', verificationStatus: 'verified', evidenceNote: 'Vegetarian', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Grain free sev', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 340, protein: 12, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  // ==========================================
  // OUTLET 9: TRISHNA SEAFOOD (Mumbai - Coastal)
  // ==========================================
  {
    outlet_id: '9',
    outlet_slug: 'demo-trishna',
    outlet_name: 'Trishna Seafood & Coastal',
    cuisine_type: 'Mangalorean & Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '901',
    menu_name: 'Trishna Classic Catch Menu',
    service_period: 'all_day',
    dish_id: '901',
    dish_name: 'Butter Garlic Jumbo Crab',
    description: 'Iconic whole sea crab simmered in a luscious emulsion of dairy butter, roasted crushed golden garlic, and white pepper.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Head Chef Master Sheet',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '750.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'crab', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Sea mud crab', verifiedAt: null },
      { name: 'butter', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Pure butter', verifiedAt: null },
      { name: 'garlic', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Crushed garlic', verifiedAt: null },
      { name: 'black pepper', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'shellfish', verificationStatus: 'verified', ingredientName: 'crab', ingredientVerificationStatus: 'verified', evidenceNote: 'Crustacean', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'butter', ingredientVerificationStatus: 'verified', evidenceNote: 'Dairy butter', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [],
    nutrition: { calories: 420, protein: 32, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  {
    outlet_id: '9',
    outlet_slug: 'demo-trishna',
    outlet_name: 'Trishna Seafood & Coastal',
    cuisine_type: 'Mangalorean & Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '901',
    menu_name: 'Trishna Classic Catch Menu',
    service_period: 'all_day',
    dish_id: '902',
    dish_name: 'Koliwada Wild Prawns Fry',
    description: 'Fresh succulent Arabian Sea prawns dredged in spicy carom-chili batter and flash-fried to an intense crunch.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Head Chef Master Sheet',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '520.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'prawns', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Prawns', verifiedAt: null },
      { name: 'chickpea flour', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Besan', verifiedAt: null },
      { name: 'ajwain', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Carom seed', verifiedAt: null },
      { name: 'chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Degi mirch', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'shellfish', verificationStatus: 'verified', ingredientName: 'prawns', ingredientVerificationStatus: 'verified', evidenceNote: 'Crustacean', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Gram flour batter', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 310, protein: 26, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  // ==========================================
  // OUTLET 11: BRITANNIA & CO. (Mumbai - Parsi & Irani)
  // ==========================================
  {
    outlet_id: '11',
    outlet_slug: 'demo-britannia-co',
    outlet_name: 'Britannia & Co. Restaurant',
    cuisine_type: 'Parsi & Irani',
    time_zone: 'Asia/Kolkata',
    menu_id: '1101',
    menu_name: 'Britannia Heritage Log Menu',
    service_period: 'all_day',
    dish_id: '1101',
    dish_name: 'Signature Mutton Berry Pulao',
    description: 'Fragrant saffron and cardamom basmati rice layered with succulent boneless mutton gravy and tart ruby Iranian zereshk berries.',
    category: 'rice',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Family Heritage Ledger',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '550.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'mutton', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Tender goat meat', verifiedAt: null },
      { name: 'basmati rice', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Aged rice', verifiedAt: null },
      { name: 'zereshk', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Iranian barberries', verifiedAt: null },
      { name: 'ghee', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Clarified butter', verifiedAt: null },
    ],
    allergen_links: [
      { name: 'milk', verificationStatus: 'verified', ingredientName: 'ghee', ingredientVerificationStatus: 'verified', evidenceNote: 'Dairy ghee', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'Pure rice & meat', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 580, protein: 34, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  // ==========================================
  // OUTLET 12: BADE MIYA (Mumbai - Mughlai Grills)
  // ==========================================
  {
    outlet_id: '12',
    outlet_slug: 'demo-bade-miya',
    outlet_name: 'Bade Miya Kababs',
    cuisine_type: 'Mughlai & Grills',
    time_zone: 'Asia/Kolkata',
    menu_id: '1201',
    menu_name: 'Colaba Night Grills Menu',
    service_period: 'all_day',
    dish_id: '1201',
    dish_name: 'Charcoal Mutton Seekh Kebab',
    description: 'Minced spiced young lamb infused with fresh mint, coriander, roasted cumin and green chilies, charred over open charcoal mangal.',
    category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Grill Master Log',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '360.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'lamb', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Minced lamb', verifiedAt: null },
      { name: 'mint', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'coriander', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'cumin', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [],
    dietary_tags: [
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy', verifiedAt: '2026-01-10T10:00:00Z' },
      { slug: 'demo-gluten-free', label: 'Gluten-Free', verificationStatus: 'verified', evidenceNote: 'No flour binding', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 380, protein: 30, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
  // ==========================================
  // OUTLET 13: GAJALEE (Mumbai - Malvani Coastal)
  // ==========================================
  {
    outlet_id: '13',
    outlet_slug: 'demo-gajalee',
    outlet_name: 'Gajalee Coastal Fish House',
    cuisine_type: 'Malvani Coastal',
    time_zone: 'Asia/Kolkata',
    menu_id: '1301',
    menu_name: 'Konkan Coastline Fresh Catch Menu',
    service_period: 'all_day',
    dish_id: '1301',
    dish_name: 'Crisp Malvani Bombil Fry',
    description: 'Whole tender Bombay duck fish marinated in red Malvani masala and kokum juice, crusted with fine semolina and flash-fried to a shatteringly crisp skin.',
    category: 'small_plate',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Coastal Kitchen Standard',
    ingredient_data_checked_at: '2026-01-10T10:00:00Z',
    price: '380.00',
    currency_code: 'INR',
    availability_status: 'available',
    ingredients: [
      { name: 'bombil fish', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Bombay duck', verifiedAt: null },
      { name: 'semolina', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: 'Rava crust', verifiedAt: null },
      { name: 'kokum', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
      { name: 'chili', presenceStatus: 'contains', verificationStatus: 'verified', evidenceNote: null, verifiedAt: null },
    ],
    allergen_links: [
      { name: 'fish', verificationStatus: 'verified', ingredientName: 'bombil fish', ingredientVerificationStatus: 'verified', evidenceNote: 'Finfish', verifiedAt: '2026-01-10T10:00:00Z' },
      { name: 'wheat', verificationStatus: 'verified', ingredientName: 'semolina', ingredientVerificationStatus: 'verified', evidenceNote: 'Wheat semolina rava', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    dietary_tags: [
      { slug: 'demo-dairy-free', label: 'Dairy-Free', verificationStatus: 'verified', evidenceNote: 'No dairy used', verifiedAt: '2026-01-10T10:00:00Z' },
    ],
    nutrition: { calories: 290, protein: 22, status: 'verified' },
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  },
];

const KNOWN_VALUES = {
  outlets: {
    cuisine_type: new Set([
      'South Indian', 'North Indian', 'Indian Homestyle', 'Hyderabadi Mughlai',
      'Kashmiri & Awadhi', 'Goan & Coastal', 'Street Food & Chaat',
      'Gujarati & Maharashtrian', 'Mangalorean & Coastal', 'Parsi & Irani',
      'Mughlai & Grills', 'Malvani Coastal',
      'Modern American', 'Persian', 'Thai', 'Canadian',
    ]),
  },
  dishes: {
    category: new Set(['main', 'small_plate', 'soup', 'dessert', 'beverage', 'breads', 'rice']),
  },
  dietary_tags: {
    slug: new Set(['demo-vegetarian', 'demo-vegan', 'demo-gluten-free', 'demo-dairy-free']),
  },
  allergens: {
    name: new Set(['wheat', 'milk', 'egg', 'peanuts', 'sesame', 'fish', 'shellfish', 'soy', 'tree nuts', 'mustard']),
  },
  ingredients: {
    name: new Set([
      'rice', 'urad dal', 'potato', 'onion', 'ghee', 'mustard seed', 'curry leaf', 'coconut',
      'sambar dal', 'paneer', 'black pepper', 'tomato', 'ginger', 'butter', 'cream', 'fenugreek',
      'black lentils', 'kidney beans', 'wheat flour', 'chickpea', 'coffee', 'milk', 'bell pepper',
      'peanuts', 'lemon', 'chickpea flour', 'sesame', 'green chili', 'chicken', 'carrot',
      'cauliflower', 'saffron', 'tamarind', 'lotus stem', 'fennel', 'mint', 'coconut milk',
      'raw mango', 'red chili', 'kokum', 'garlic', 'wheat bread', 'yogurt', 'mango', 'cardamom',
      'pistachio', 'almond',
    ]),
  },
};

function executeMockQuery(sql, values = []) {
  const normalized = sql.trim().replace(/\s+/g, ' ');

  // 1. Health check
  if (normalized === 'SELECT 1' || normalized.startsWith('SELECT 1')) {
    return { rowCount: 1, rows: [{ '?column?': 1 }] };
  }

  // 2. Count active outlets
  if (normalized.includes('SELECT count(*)::int AS total FROM outlets WHERE is_active = true')) {
    const total = OUTLETS.filter((o) => o.is_active).length;
    return { rowCount: 1, rows: [{ total }] };
  }

  // 3. List outlets (with pagination)
  if (normalized.includes('FROM outlets') && normalized.includes('ORDER BY name, id')) {
    const limit = Number(values[0] ?? 20);
    const offset = Number(values[1] ?? 0);
    const rows = OUTLETS.filter((o) => o.is_active).slice(offset, offset + limit);
    return { rowCount: rows.length, rows };
  }

  // 4. Restaurant search by name or slug (with aliases for backwards compatibility)
  if (normalized.includes('FROM outlets') && normalized.includes('slug ILIKE $1 OR name ILIKE $1')) {
    const searchVal = String(values[0] || '').toLowerCase().trim();
    const outlet = OUTLETS.find((o) => 
      o.name.toLowerCase() === searchVal ||
      o.slug.toLowerCase() === searchVal ||
      (searchVal.includes('dakshin') && o.id === '1') ||
      (searchVal.includes('juniper') && o.id === '1') ||
      (searchVal.includes('punjab') && o.id === '2') ||
      (searchVal.includes('copper') && o.id === '3') ||
      (searchVal.includes('biryani') && o.id === '4') ||
      (searchVal.includes('saffron') && o.id === '5') ||
      (searchVal.includes('coastal') && o.id === '6') ||
      (searchVal.includes('chowpatty') && o.id === '7')
    );
    return { rowCount: outlet ? 1 : 0, rows: outlet ? [outlet] : [] };
  }

  // 5. Single outlet by ID
  if (normalized.includes('FROM outlets') && (normalized.includes('WHERE id = $1') || normalized.includes('WHERE id = ?'))) {
    const outletId = String(values[0] ?? '');
    const outlet = OUTLETS.find((o) => String(o.id) === outletId || o.slug === outletId);
    return { rowCount: outlet ? 1 : 0, rows: outlet ? [outlet] : [] };
  }

  // 6. assertValuesExist: SELECT ${column} FROM ${table} WHERE ${column} = ANY($1::text[])
  const assertMatch = normalized.match(/SELECT\s+(\w+)\s+FROM\s+(\w+)\s+WHERE\s+\1\s*=\s*ANY\(\$1::text\[\]\)/i);
  if (assertMatch) {
    const column = assertMatch[1];
    const table = assertMatch[2];
    const requested = values[0] || [];
    const validSet = KNOWN_VALUES[table]?.[column] || new Set();
    const rows = requested.filter((v) => validSet.has(v)).map((v) => ({ [column]: v }));
    return { rowCount: rows.length, rows };
  }

  // 7. Analytics queries
  if (normalized.includes('FROM recommendation_feedback')) {
    return { rowCount: 0, rows: [] };
  }
  if (normalized.includes('FROM confirmed_discoveries')) {
    return { rowCount: 1, rows: [{ count: 0 }] };
  }

  // 8. Count dishes matching menu query
  if (normalized.includes('SELECT count(*)::int AS total FROM menu_dishes md')) {
    let filtered = [...ENTRIES];
    if (values[0] !== undefined) {
      filtered = filtered.filter((e) => String(e.outlet_id) === String(values[0]));
    }
    return { rowCount: 1, rows: [{ total: filtered.length }] };
  }

  // 9. Query menu entries
  if (normalized.includes('FROM menu_dishes md') || normalized.includes('o.id AS outlet_id')) {
    let filtered = [...ENTRIES];

    // Outlet filter
    const outletIdVal = values.find((v) => typeof v === 'string' && /^[1-9]\d*$/.test(v));
    if (outletIdVal) {
      filtered = filtered.filter((e) => String(e.outlet_id) === String(outletIdVal));
    }

    // Dish ID filter (for getDish)
    if (normalized.includes('d.id = $1') || normalized.includes('d.id = $2')) {
      const dishIdVal = String(values[values.length - 1]);
      filtered = filtered.filter((e) => String(e.dish_id) === dishIdVal);
    }

    // Availability filter
    if (normalized.includes("md.availability_status = 'available'")) {
      filtered = filtered.filter((e) => e.availability_status === 'available');
    }

    // Price bounds
    const minPriceMatch = normalized.match(/md\.price >=\s*\$(\d+)::numeric/);
    if (minPriceMatch) {
      const minP = Number(values[parseInt(minPriceMatch[1], 10) - 1]);
      filtered = filtered.filter((e) => Number(e.price) >= minP);
    }
    const maxPriceMatch = normalized.match(/md\.price <=\s*\$(\d+)::numeric/);
    if (maxPriceMatch) {
      const maxP = Number(values[parseInt(maxPriceMatch[1], 10) - 1]);
      filtered = filtered.filter((e) => Number(e.price) <= maxP);
    }

    // Search query
    const searchMatch = normalized.match(/d\.name ILIKE '%' \|\| \$(\d+) \|\| '%'/);
    if (searchMatch) {
      const searchWord = String(values[parseInt(searchMatch[1], 10) - 1] || '').toLowerCase();
      filtered = filtered.filter((e) => e.dish_name.toLowerCase().includes(searchWord) || e.description.toLowerCase().includes(searchWord));
    }

    return { rowCount: filtered.length, rows: filtered };
  }

  return { rowCount: 0, rows: [] };
}

function createMockPool() {
  return {
    async query(sql, values = []) {
      return executeMockQuery(sql, values);
    },
    async end() {},
    on() {},
  };
}

module.exports = {
  createMockPool,
  OUTLETS,
  ENTRIES,
  KNOWN_VALUES,
};
