require('dotenv').config()

const bcrypt = require('bcrypt')
const prisma = require('../lib/prisma')

const userId = '10000000-0000-4000-8000-000000000001'

const categories = [
  { category_id: '20000000-0000-4000-8000-000000000001', name: 'Indonesian' },
  { category_id: '20000000-0000-4000-8000-000000000002', name: 'Quick & easy' },
  { category_id: '20000000-0000-4000-8000-000000000003', name: 'Comfort food' },
  { category_id: '20000000-0000-4000-8000-000000000004', name: 'Seafood' }
]

const recipes = [
  {
    recipe_id: '30000000-0000-4000-8000-000000000001',
    title: 'Nasi goreng kampung',
    description: 'Smoky Indonesian fried rice with egg, cucumber, tomato, and crisp shallots.',
    image_url: '/images/recipes/nasi-goreng.jpg',
    categoryId: categories[0].category_id,
    ingredients: [['Cooked rice', '2 bowls'], ['Egg', '1'], ['Sweet soy sauce', '2 tbsp'], ['Shallot', '2']],
    instructions: ['Prepare the aromatics and loosen the cold rice.', 'Stir-fry over high heat until the rice smells smoky.', 'Finish with egg, cucumber, tomato, and crisp shallots.']
  },
  {
    recipe_id: '30000000-0000-4000-8000-000000000002',
    title: 'Beef bulgogi bowl',
    description: 'Tender marinated beef, steamed rice, sesame, and bright pickled vegetables.',
    image_url: '/images/recipes/beef-bulgogi.jpg',
    categoryId: categories[1].category_id,
    ingredients: [['Thinly sliced beef', '400 g'], ['Soy sauce', '3 tbsp'], ['Sesame oil', '1 tbsp'], ['Cooked rice', '2 bowls']],
    instructions: ['Marinate the beef for at least 20 minutes.', 'Sear in a very hot pan in two batches.', 'Serve over rice with sesame and vegetables.']
  },
  {
    recipe_id: '30000000-0000-4000-8000-000000000003',
    title: 'Weeknight chicken curry',
    description: 'A warmly spiced chicken curry that comes together in one pan.',
    image_url: '/images/recipes/chicken-curry.jpg',
    categoryId: categories[2].category_id,
    ingredients: [['Chicken thighs', '600 g'], ['Coconut milk', '400 ml'], ['Curry powder', '2 tbsp'], ['Garlic', '3 cloves']],
    instructions: ['Toast the spices until fragrant.', 'Brown the chicken on both sides.', 'Add coconut milk and simmer gently until tender.']
  },
  {
    recipe_id: '30000000-0000-4000-8000-000000000004',
    title: 'Salmon teriyaki',
    description: 'Glazed salmon with a glossy soy-ginger sauce and a crisp edge.',
    image_url: '/images/recipes/salmon-teriyaki.jpg',
    categoryId: categories[3].category_id,
    ingredients: [['Salmon fillets', '2'], ['Soy sauce', '3 tbsp'], ['Fresh ginger', '2 cm'], ['Brown sugar', '1 tbsp']],
    instructions: ['Whisk together the teriyaki glaze.', 'Sear the salmon until the edges are crisp.', 'Reduce the sauce and spoon it over the fish.']
  }
]

async function seed () {
  const password = await bcrypt.hash('HomeCook123', 12)
  await prisma.user.upsert({
    where: { email: 'demo@recipenation.local' },
    update: { name: 'Dimas Prasetyo', is_verified: true },
    create: { user_id: userId, name: 'Dimas Prasetyo', email: 'demo@recipenation.local', phone_number: '+62 812 5550 1442', password, is_verified: true }
  })

  for (const category of categories) {
    await prisma.category.upsert({ where: { name: category.name }, update: {}, create: category })
  }

  for (const recipe of recipes) {
    await prisma.$transaction(async (tx) => {
      await tx.recipe.upsert({
        where: { recipe_id: recipe.recipe_id },
        update: { title: recipe.title, description: recipe.description, instructions: recipe.instructions, image_url: recipe.image_url },
        create: { recipe_id: recipe.recipe_id, user_id: userId, title: recipe.title, description: recipe.description, instructions: recipe.instructions, image_url: recipe.image_url }
      })
      await tx.ingredient.deleteMany({ where: { recipeId: recipe.recipe_id } })
      await tx.ingredient.createMany({ data: recipe.ingredients.map(([name, quantity], index) => ({ recipeId: recipe.recipe_id, name, quantity, position: index + 1 })) })
      await tx.recipeCategory.deleteMany({ where: { recipeId: recipe.recipe_id } })
      await tx.recipeCategory.create({ data: { recipeId: recipe.recipe_id, categoryId: recipe.categoryId } })
    })
  }

  process.stdout.write(`Seeded ${recipes.length} recipes for demo@recipenation.local\n`)
}

seed()
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
