export interface WoodResult {
  species: string;
  scientificName: string;
  confidence: number;
  origin: string;
  grain: string;
  texture: string;
  color: string;
  hardness: number;
  workability: string;
  finishing: string;
  bestUses: string[];
  costPerBoardFoot: string;
  availability: string;
  sustainability: string;
  funFact: string;
}

export const MOCK_WOOD_DATA: WoodResult[] = [
  {
    species: "Black Walnut",
    scientificName: "Juglans nigra",
    confidence: 94,
    origin: "Eastern North America",
    grain: "Straight to slightly wavy grain with a medium to coarse texture",
    texture: "Medium to coarse, open-grained surface",
    color: "Rich chocolate brown heartwood with pale yellowish-white sapwood",
    hardness: 1010,
    workability: "Works well with both hand and machine tools. Glues, stains, and finishes well.",
    finishing: "Finishes beautifully with oil, wax, or lacquer. Takes stain evenly.",
    bestUses: ["Fine furniture", "Gunstocks", "Cabinetry", "Flooring", "Veneer"],
    costPerBoardFoot: "$8–15",
    availability: "Readily available",
    sustainability: "Moderately sustainable. Not endangered. Grown commercially in North America.",
    funFact: "Black walnut produces juglone, a chemical that inhibits the growth of many other plants nearby.",
  },
  {
    species: "White Oak",
    scientificName: "Quercus alba",
    confidence: 91,
    origin: "Eastern North America",
    grain: "Straight grain with a coarse, uneven texture; prominent ray flecks on quartersawn surfaces",
    texture: "Coarse and uneven with visible open pores",
    color: "Light to medium brown with a slight grayish cast",
    hardness: 1360,
    workability: "Machines well but can be difficult to work by hand due to hardness. Glues and finishes well.",
    finishing: "Accepts stains and finishes well. Oil finishes enhance the natural ray fleck figure.",
    bestUses: ["Flooring", "Barrels and cooperage", "Furniture", "Cabinetry", "Boat building"],
    costPerBoardFoot: "$4–8",
    availability: "Very widely available",
    sustainability: "Abundant and sustainable. One of the most common hardwoods in North America.",
    funFact: "White oak is used to make whiskey and wine barrels because its closed pores prevent liquid from leaking.",
  },
  {
    species: "Hard Maple",
    scientificName: "Acer saccharum",
    confidence: 88,
    origin: "Northeastern North America",
    grain: "Generally straight, but can be wavy or curly producing highly figured bird's eye or tiger patterns",
    texture: "Fine and even with a natural luster",
    color: "Creamy white to light golden brown, often with a reddish tinge",
    hardness: 1450,
    workability: "Can be difficult to work due to hardness. Prone to burning when routing or sawing. Turns and finishes well.",
    finishing: "Finishes very well. Clear finishes showcase the natural figure. Blotchy with stain — pre-conditioner recommended.",
    bestUses: ["Flooring", "Bowling alleys", "Butcher blocks", "Musical instruments", "Furniture"],
    costPerBoardFoot: "$3–7",
    availability: "Readily available",
    sustainability: "Sustainable and abundant. The primary source of maple syrup in North America.",
    funFact: "Hard maple is so dense it is used for professional basketball court floors, including the NBA.",
  },
  {
    species: "Teak",
    scientificName: "Tectona grandis",
    confidence: 96,
    origin: "South and Southeast Asia",
    grain: "Straight to slightly wavy grain with a coarse, uneven texture",
    texture: "Coarse and uneven; oily to the touch due to natural oils",
    color: "Golden to medium brown when freshly cut, weathering to silver-gray outdoors",
    hardness: 1000,
    workability: "Generally easy to work despite its density. Natural silica content can dull tools quickly.",
    finishing: "Finishes well but natural oils can interfere with adhesives and some finishes. Teak oil is the traditional choice.",
    bestUses: ["Outdoor furniture", "Boat decking", "Flooring", "Countertops", "Veneer"],
    costPerBoardFoot: "$20–40",
    availability: "Available but expensive; plantation-grown teak is more accessible",
    sustainability: "Wild teak is endangered in some regions. Look for FSC-certified plantation teak.",
    funFact: "Teak has been used in shipbuilding for over 2,000 years and can last centuries when exposed to the elements.",
  },
  {
    species: "Cherry",
    scientificName: "Prunus serotina",
    confidence: 89,
    origin: "Eastern North America",
    grain: "Straight grain with a fine, uniform texture",
    texture: "Fine and smooth with a natural luster",
    color: "Light pinkish-brown when freshly cut, darkening to a rich reddish-brown with age and light exposure",
    hardness: 950,
    workability: "Easy to work with hand and machine tools. Glues, stains, and finishes very well.",
    finishing: "One of the best finishing woods. Develops a beautiful patina over time. Minimal prep needed.",
    bestUses: ["Fine furniture", "Cabinetry", "Millwork", "Musical instruments", "Turned objects"],
    costPerBoardFoot: "$5–10",
    availability: "Readily available",
    sustainability: "Sustainable and well-managed in North America. Not threatened.",
    funFact: "Cherry wood continues to darken and deepen in color for years after being crafted, making antique cherry pieces especially prized.",
  },
  {
    species: "Purpleheart",
    scientificName: "Peltogyne spp.",
    confidence: 97,
    origin: "Central and South America",
    grain: "Straight to slightly interlocked grain with a medium texture",
    texture: "Medium and uniform with a natural luster",
    color: "Vivid purple when freshly cut, darkening to a deep eggplant-brown with UV exposure",
    hardness: 1860,
    workability: "Difficult to work due to hardness and interlocked grain. Can cause tearout. Turns and finishes well.",
    finishing: "Finishes well. UV-inhibiting finishes help preserve the purple color. Oil finishes deepen the tone.",
    bestUses: ["Accent pieces", "Inlays", "Flooring", "Furniture", "Skateboard decks"],
    costPerBoardFoot: "$10–18",
    availability: "Moderately available through specialty dealers",
    sustainability: "Not currently threatened but tropical origin warrants FSC certification preference.",
    funFact: "Purpleheart's vivid color comes from a compound called peltogynol, which oxidizes and changes hue when exposed to light and air.",
  },
];
