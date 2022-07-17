require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

/**
 * GET /
 * Homepage 
*/
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);

    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Cooking Blog - Home', categories, food });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}


/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}


/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({ $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }

}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}



/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}


/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async (req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj });
}

/**
 * POST /submit-recipe
 * Submit Recipe
*/
exports.submitRecipeOnPost = async (req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.satus(500).send(err);
      })

    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName
    });

    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}

/**
 * Creating categories 
*/

// async function insertDymmyCategoryData(){
//   try {
//     await Category.insertMany([
//       {
//         "name": "Thai",
//         "image": "thai-food.jpg"
//       },
//       {
//         "name": "American",
//         "image": "american-food.jpg"
//       }, 
//       {
//         "name": "Chinese",
//         "image": "chinese-food.jpg"
//       },
//       {
//         "name": "Mexican",
//         "image": "mexican-food.jpg"
//       }, 
//       {
//         "name": "Indian",
//         "image": "indian-food.jpg"
//       },
//       {
//         "name": "Spanish",
//         "image": "spanish-food.jpg"
//       }
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertDymmyCategoryData();

/**
 * Adding recipes 
*/

// async function insertDymmyRecipeData() {
//   try {
//     await Recipe.insertMany([
//       {
//         "name": "Boiled prawn wontons with chilli dressing",
//         "description": `First, make the sichuan seasoning. Dry-roast the sichuan pepper and 3 teaspoons of sea salt in a heavy-based pan. When the peppercorns start to pop and become aromatic, remove from the heat and allow to cool. Once cool, grind to a powder in a pestle and mortar or spice grinder.
//         Next, make the chilli dressing. Place the chilli flakes in a heatproof bowl. Heat the oil in a small heavy-based frying pan until it shimmers slightly, then carefully pour the oil over the chilli to release the heat and flavour.
//         Stir, then let stand, uncovered, for 30 minutes. Strain the oil through a fine sieve over a bowl (discard the chilli), and mix with remaining dressing ingredients.
//         For the wontons, peel, dice and place the prawn meat in a bowl. Trim and finely slice the spring onion, peel and finely slice the ginger, then add to the bowl with all the remaining ingredients, except the wonton wrappers, and mix until combined. Cover and refrigerate for 30 minutes.
//         For each wonton, place a rounded teaspoon of prawn filling in the centre of a wrapper. Dip your finger in some water and moisten the bottom edge of the wrapper, then fold it in half, towards you, to enclose the filling. Smoothing out any air, press to seal. Hold the wonton lengthways with the folded edge down. Fold in half lengthways, then lightly moisten one corner of the folded edge. Bring the two ends together with a twisting action and press lightly to seal, making a ring shape.
//         Bring a large pan of water to the boil. Carefully drop the wontons, in batches, into the water and cook for 2 minutes, or till just cooked through. To test if the wontons are ready, remove one using a slotted spoon and cut through it with a sharp knife. The prawns should be just cooked through. Remove the other wontons and drain in a colander.
//         To serve, arrange the wontons on a serving platter. Stir the chilli dressing and then spoon it over the wontons. Serve immediately, sprinkled with sichuan seasoning.
//         `,
//         "email": "recipeemail@raddy.co.uk",
//         "ingredients": [
//           "24 fresh wonton wrappers (about 7cm square)",
//           "225 g raw prawns, from sustainable sources",
//           "1 spring onion",
//           "1cm piece of ginger",
//           "1½ teaspoon shaoxing wine or dry sherry",
//           "3 tablespoons light soy sauce",
//           "½ teaspoon white sugar",
//           "½ teaspoon sesame oil",
//           "SICHUAN SEASONING",
//           "1 tablespoon sichuan pepper",
//           "3 tablespoons sea salt",
//           "CHILLI DRESSING",
//           "1 teaspoon dried chilli flakes",
//           "40 ml vegetable oil",
//           "20 ml light soy sauce",
//           "20 ml rice wine vinegar",
//           "1 teaspoon white sugar",
//           "1 pinch of sichuan seasoning",

//         ],
//         "category": "Chinese",
//         "image": "Boiled prawn wontons with chilli dressing.webp"
//       },
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertDymmyRecipeData();

