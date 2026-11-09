/**
 * Ingredient substitutes so the same recipe works in Berlin, in an Indian city and in a village.
 * town = Indian town/city supermarket; village = what a village kirana or farm usually has.
 */
export interface Substitute {
  town?: string
  village?: string
  germany?: string
  why?: string
}

export const SUBSTITUTES: Record<string, Substitute> = {
  berries: { town: 'pomegranate, guava or amla', village: 'amla (nellikai), jamun in season, or a squeeze of lemon', why: 'all give the vitamin C that helps iron absorption' },
  avocado: { town: 'banana or a spoon of coconut', village: 'fresh coconut or a few groundnuts', why: 'healthy fat and creaminess' },
  broccoli: { town: 'cauliflower or beans', village: 'cauliflower, beans or drumstick', why: 'same fibre, cheaper' },
  'frozen broccoli': { town: 'cauliflower', village: 'cauliflower or cabbage' },
  zucchini: { town: 'bottle gourd (sorakkai) or ridge gourd', village: 'any local gourd: sorakkai, peerkangai, pudalangai' },
  'bell pepper': { town: 'capsicum', village: 'green capsicum or extra tomato' },
  capsicum: { village: 'extra tomato or beans' },
  'frozen spinach': { town: 'fresh palak / keerai', village: 'any local greens: arai keerai, murungai keerai, ponnanganni', why: 'local greens are higher in iron' },
  spinach: { village: 'arai keerai, siru keerai, murungai keerai (drumstick leaves)', why: 'drumstick leaves have far more iron' },
  rocket: { town: 'coriander leaves or lettuce', village: 'coriander leaves' },
  lettuce: { town: 'cabbage shreds or cucumber', village: 'cucumber, carrot, cabbage' },
  quinoa: { town: 'foxtail millet (thinai) or little millet (samai)', village: 'any millet: thinai, varagu, samai, kambu', why: 'millets have the same protein and more iron' },
  oats: { town: 'broken wheat (godhumai rava) or ragi', village: 'ragi, kambu or broken rice', why: 'same slow carbs' },
  'rolled oats': { town: 'broken wheat (godhumai rava) or ragi', village: 'ragi or broken rice' },
  'greek yogurt': { town: 'hung curd (thick curd drained in a cloth for 2 hours)', village: 'thick home curd', why: 'same protein, same tang' },
  quark: { town: 'hung curd or fresh paneer crumbled', village: 'thick home curd' },
  'cottage cheese': { town: 'fresh crumbled paneer', village: 'home paneer from boiled milk + lemon' },
  skyr: { town: 'hung curd', village: 'thick home curd' },
  mozzarella: { town: 'fresh paneer', village: 'home paneer' },
  feta: { town: 'salted crumbled paneer', village: 'home paneer with salt' },
  parmesan: { town: 'skip, or a little grated paneer', village: 'skip' },
  salmon: { town: 'seer fish (vanjaram) or any oily local fish', village: 'local river or sea fish from the market', why: 'any fresh fish works; oily fish gives the omega-3' },
  cod: { town: 'any white fish: sankara, tilapia, basa', village: 'local white fish' },
  pangasius: { town: 'basa or tilapia', village: 'local white fish' },
  'frozen fish fillet': { town: 'any fresh white fish', village: 'local fish' },
  'canned tuna': { town: 'fresh tuna (choora) or any fish', village: 'local fish' },
  'frozen prawns': { town: 'fresh prawns from the market', village: 'fresh prawns where available, else fish' },
  'king fish': { germany: 'mackerel (Makrele) or salmon' },
  'chicken breast': { village: 'country chicken (naattu kozhi) pieces, less of it', why: 'country chicken is leaner and tastier' },
  'chicken thigh': { village: 'country chicken pieces' },
  'whole wheat bread': { town: 'chapati or whole wheat roti', village: 'chapati or dosa' },
  bread: { town: 'chapati', village: 'chapati or dosa' },
  'tortilla wraps': { town: 'chapati', village: 'chapati' },
  'whole wheat pasta': { town: 'any whole wheat pasta or semiya', village: 'semiya (vermicelli) or broken wheat' },
  spaghetti: { town: 'whole wheat spaghetti or semiya', village: 'semiya' },
  'tomato passata': { town: 'fresh tomatoes blended', village: 'fresh tomatoes cooked and mashed' },
  'canned tomatoes': { town: 'fresh tomatoes', village: 'fresh tomatoes' },
  'canned chickpeas': { town: 'dried chickpeas soaked overnight', village: 'dried kabuli or black chana soaked overnight' },
  'canned kidney beans': { town: 'dried rajma soaked overnight', village: 'dried rajma or karamani soaked overnight' },
  'red lentils': { town: 'masoor dal', village: 'masoor or moong dal' },
  lentils: { town: 'whole masoor', village: 'whole masoor or horse gram' },
  'pumpkin seeds': { town: 'roasted peanuts or sesame', village: 'sesame (ellu) or groundnuts', why: 'zinc and magnesium' },
  'sunflower seeds': { town: 'peanuts or sesame', village: 'sesame or groundnuts' },
  'chia seeds': { town: 'sabja (basil) seeds or flax seeds', village: 'flax (ali vidhai) seeds' },
  'flax seeds': { village: 'sesame' },
  almonds: { town: 'peanuts', village: 'groundnuts', why: 'much cheaper, similar protein' },
  walnuts: { town: 'peanuts or a little coconut', village: 'groundnuts' },
  cashews: { village: 'groundnuts or a little coconut' },
  dates: { village: 'jaggery (vellam), a little' },
  honey: { village: 'jaggery' },
  'olive oil': { town: 'groundnut or gingelly (sesame) oil', village: 'gingelly or coconut oil', why: 'traditional oils are fine; keep the quantity small' },
  'sweet potato': { village: 'sakkaravalli kizhangu, same thing, or tapioca' },
  'brown rice': { town: 'hand-pounded / red rice (sivappu arisi)', village: 'local red or boiled rice (puzhungal arisi)', why: 'parboiled rice keeps more of the nutrients' },
  'basmati rice': { town: 'seeraga samba or any local rice', village: 'local rice' },
  'vegetable stock': { town: 'water with a pinch of salt and cumin', village: 'water, dal water (paruppu thanni) or rasam' },
  'chicken stock': { town: 'water the chicken was boiled in', village: 'chicken boiled water' },
  'coconut milk': { village: 'fresh coconut ground and squeezed' },
  'frozen grated coconut': { town: 'fresh coconut', village: 'fresh coconut' },
  'desiccated coconut': { village: 'fresh grated coconut' },
  'frozen peas': { town: 'fresh peas in season or dried peas soaked', village: 'beans or dried peas soaked' },
  peas: { village: 'beans or dried peas soaked' },
  'frozen mixed vegetables': { town: 'whatever vegetables are fresh', village: 'seasonal vegetables from the market' },
  'sweet corn': { village: 'fresh corn in season, else skip' },
  mushrooms: { village: 'brinjal or cauliflower' },
  leek: { town: 'spring onion', village: 'onion' },
  celery: { town: 'skip, or coriander stems', village: 'skip' },
  'whole chicken': { village: 'country chicken' },
  makhana: { town: 'roasted chana', village: 'roasted chana or puffed rice' },
  tofu: { town: 'paneer', village: 'home paneer' },
  'soya chunks': { village: 'extra dal or black chana' },
  'cream cheese': { town: 'hung curd', village: 'thick curd' },
  cream: { town: 'a little milk or cashew paste', village: 'coconut milk' },
  lime: { village: 'lemon or tamarind' },
  lemon: { village: 'tamarind water or raw mango in season', why: 'any sour fruit adds the vitamin C' }
}

export function substituteFor(name: string): Substitute | undefined {
  return SUBSTITUTES[name.toLowerCase()]
}
