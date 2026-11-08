// Canonical ingredient catalog with where to buy it in Berlin.
// 'german' = Rewe / Lidl / Edeka / Aldi / Kaufland.  'indian' = Indian or Asian store.
// Dish files should reuse these names; unknown names default to 'german'.
export type Store = 'german' | 'indian'

export const INGREDIENT_STORE: Record<string, Store> = {
  // --- Indian store ---
  'idly rice': 'indian', 'idly rava': 'indian', 'urad dal': 'indian', 'toor dal': 'indian', 'moong dal': 'indian',
  'whole moong': 'indian', 'chana dal': 'indian', 'masoor dal': 'indian', 'black chana': 'indian', 'rajma': 'indian', 'chickpeas': 'german',
  'poha': 'indian', 'rava': 'indian', 'besan': 'indian', 'ragi flour': 'indian', 'jowar flour': 'indian', 'bajra flour': 'indian',
  'atta': 'indian', 'sona masoori rice': 'indian', 'basmati rice': 'german', 'brown rice': 'german', 'red rice': 'indian', 'millet': 'indian',
  'vermicelli': 'indian', 'papad': 'indian', 'pickle': 'indian', 'roasted chana dal': 'indian',
  'sambar powder': 'indian', 'rasam powder': 'indian', 'garam masala': 'indian', 'chicken masala': 'indian', 'fish masala': 'indian',
  'biryani masala': 'indian', 'chaat masala': 'indian', 'pav bhaji masala': 'indian', 'kitchen king masala': 'indian', 'chettinad masala': 'indian',
  'turmeric': 'indian', 'red chilli powder': 'indian', 'kashmiri chilli powder': 'indian', 'coriander powder': 'indian', 'cumin powder': 'indian',
  'cumin seeds': 'indian', 'mustard seeds': 'indian', 'fenugreek seeds': 'indian', 'fennel seeds': 'indian', 'black pepper': 'german',
  'asafoetida': 'indian', 'curry leaves': 'indian', 'dried red chilli': 'indian', 'green chilli': 'indian', 'tamarind': 'indian',
  'cardamom': 'indian', 'cloves': 'indian', 'cinnamon': 'german', 'bay leaf': 'german', 'star anise': 'indian', 'kasuri methi': 'indian',
  'amchur': 'indian', 'ajwain': 'indian', 'black salt': 'indian', 'jaggery': 'indian', 'coconut oil': 'german', 'ghee': 'indian',
  'desiccated coconut': 'german', 'frozen grated coconut': 'indian', 'coconut milk': 'german', 'cashews': 'german', 'peanuts': 'german',
  'drumstick': 'indian', 'frozen drumstick': 'indian', 'small onion': 'indian', 'okra': 'indian', 'bitter gourd': 'indian', 'bottle gourd': 'indian',
  'ridge gourd': 'indian', 'snake gourd': 'indian', 'raw banana': 'indian', 'ivy gourd': 'indian', 'yam': 'indian', 'methi leaves': 'indian',
  'coriander leaves': 'german', 'mint leaves': 'german', 'ginger': 'german', 'garlic': 'german', 'ginger garlic paste': 'indian',
  'paneer': 'indian', 'curd': 'german', 'dosa batter': 'indian', 'frozen paratha': 'indian',
  'king fish': 'indian', 'seer fish': 'indian', 'pomfret': 'indian', 'mackerel': 'indian', 'sardine': 'indian', 'tilapia': 'indian',
  'frozen prawns': 'german', 'prawns': 'german', 'lamb': 'indian', 'mutton': 'indian', 'goat': 'indian',
  'sevai': 'indian', 'puttu flour': 'indian', 'appam flour': 'indian', 'rice flour': 'indian', 'sprouts': 'german',
  'soya chunks': 'indian', 'sago': 'indian', 'horse gram': 'indian', 'black eyed peas': 'indian', 'curry powder': 'indian', 'eno': 'indian',
  // --- German supermarket ---
  'onion': 'german', 'tomato': 'german', 'potato': 'german', 'carrot': 'german', 'beans': 'german', 'green beans': 'german', 'cabbage': 'german',
  'cauliflower': 'german', 'broccoli': 'german', 'spinach': 'german', 'frozen spinach': 'german', 'zucchini': 'german', 'bell pepper': 'german',
  'capsicum': 'german', 'mushrooms': 'german', 'cucumber': 'german', 'lettuce': 'german', 'rocket': 'german', 'peas': 'german', 'frozen peas': 'german',
  'sweet corn': 'german', 'frozen mixed vegetables': 'german', 'beetroot': 'german', 'pumpkin': 'german', 'leek': 'german', 'celery': 'german',
  'spring onion': 'german', 'lemon': 'german', 'lime': 'german', 'apple': 'german', 'banana': 'german', 'orange': 'german', 'berries': 'german',
  'eggs': 'german', 'chicken breast': 'german', 'chicken thigh': 'german', 'chicken drumstick': 'german', 'whole chicken': 'german', 'chicken mince': 'german',
  'salmon': 'german', 'cod': 'german', 'pangasius': 'german', 'frozen fish fillet': 'german', 'canned tuna': 'german', 'smoked salmon': 'german',
  'milk': 'german', 'low fat milk': 'german', 'skyr': 'german', 'quark': 'german', 'greek yogurt': 'german', 'yogurt': 'german', 'butter': 'german',
  'cheese': 'german', 'parmesan': 'german', 'mozzarella': 'german', 'feta': 'german', 'cream cheese': 'german', 'cottage cheese': 'german',
  'olive oil': 'german', 'sunflower oil': 'german', 'oil': 'german', 'rapeseed oil': 'german', 'salt': 'german', 'sugar': 'german', 'honey': 'german',
  'oats': 'german', 'rolled oats': 'german', 'whole wheat bread': 'german', 'bread': 'german', 'tortilla wraps': 'german', 'quinoa': 'german',
  'whole wheat pasta': 'german', 'pasta': 'german', 'penne': 'german', 'spaghetti': 'german', 'fusilli': 'german', 'lentil pasta': 'german',
  'chickpea pasta': 'german', 'lasagne sheets': 'german', 'tomato passata': 'german', 'canned tomatoes': 'german', 'tomato paste': 'german',
  'pesto': 'german', 'red lentils': 'german', 'lentils': 'german', 'canned chickpeas': 'german', 'canned kidney beans': 'german',
  'basil': 'german', 'dried oregano': 'german', 'dried basil': 'german', 'italian herbs': 'german', 'chilli flakes': 'german', 'paprika powder': 'german',
  'soy sauce': 'german', 'vinegar': 'german', 'cornflour': 'german', 'baking soda': 'german', 'dates': 'german', 'almonds': 'german',
  'walnuts': 'german', 'chia seeds': 'german', 'flax seeds': 'german', 'sesame seeds': 'german', 'raisins': 'german', 'peanut butter': 'german',
  'vegetable stock': 'german', 'chicken stock': 'german', 'cream': 'german', 'white wine vinegar': 'german', 'capers': 'german',
  'olives': 'german', 'anchovies': 'german', 'frozen broccoli': 'german', 'frozen green beans': 'german', 'sweet potato': 'german', 'radish': 'german',
  'tofu': 'german', 'edamame': 'german', 'dill': 'german', 'eggplant': 'german', 'aubergine': 'german', 'dried thyme': 'german', 'dried rosemary': 'german', 'mustard': 'german', 'broken wheat': 'indian', 'makhana': 'indian', 'wholegrain crispbread': 'german', 'rice cakes': 'german', 'hummus': 'german', 'water': 'german'
}

export function storeFor(name: string): Store {
  return INGREDIENT_STORE[name.toLowerCase()] ?? 'german'
}
