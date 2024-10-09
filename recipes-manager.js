import readline from 'readline';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const connectionDB = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function testConnection() {
    try {
      console.log(`\n---------------------------------------------------------
                   \nDatabase ${chalk.green('connectée')}+++++++++++++++++++++++++++++++++++++++`);
    await wait(800);
      displayMenu();
    } catch (error) {
      console.error("Erreur lors du chargement. ", error);
      process.exit(1);
    } 
}

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function seeAllRecipes() {
    let recipe;
    try {
        [recipe] = await connectionDB.query(`SELECT * FROM recipes`);
            if (recipe.length === 0) {
                console.error(`\nPas de recettes à afficher.`);
            } else {
                console.log(chalk.bold(`\nVoici toutes les recettes: \n`));
                recipe.forEach(recipes => {
                    console.log(`${recipes.id} ${recipes.title}`);
                });
            }
        } catch (err) {
            console.error(`\nErreur lors de la récupération des recettes`)
    } finally {
        if (recipe && recipe.length > 0) { 
            let answer;
            while (true) {
                answer = await askQuestion(`\n------------------------------------------------------\n\nVeux-tu voir une recette en ${chalk.blue.bold(`détail`)} ou retourner au ${chalk.blue.bold(`menu`)}?  `);
                if (answer.toLowerCase() === `détail` || answer.toLowerCase() === `detail` || answer.toLowerCase() === `menu`) {
                    break;
                } else {
                    console.error(`\nRéponse invalide. Merci de répondre par "${chalk.blue.bold(`détail`)}" ou "${chalk.blue.bold(`menu`)}".`);
                }
            }
            choiceSee(answer, recipe);
        } else {
            displayMenu();
        }
    }
}

function choiceSee(answer, recipe) {
    if (answer.toLowerCase() === `détail` || answer.toLowerCase() === `detail`) {
        askQuestion(`\nEntre l'ID de la recette à aficher:  `).then(id => {
            const selectedRecipe = recipe.find(recipe => recipe.id == id);

            if (selectedRecipe) {
                console.log(`\nRecette ID: ${selectedRecipe.id}`);
                console.log(`\nNom: ${selectedRecipe.title}`);
                console.log(`\nIngrédients: ${selectedRecipe.ingredients}`);
                console.log(`\nInstructions: ${selectedRecipe.steps}`);
            } else {
                console.error(`\nRecette non trouvée.`)
            }
            askQuestion(`\nRetourner au menu? ( oui / non ):    `).then(response => {
                if (response.toLowerCase() === `oui`) {
                    displayMenu();
                } else {
                    console.error(`\nFermeture du programme.`);
                    rl.close();
                }
            });
        });
    } else {
        displayMenu(); 
    }
}
    
       
 

async function addRecipe() {
    try { 
        const title = await askQuestion(`\nQuel est le nom de la recette?  `);
        const nbrPeople = await askQuestion(`\nLa recette est pour combien de personne?  `);
        const timePrepa = await askQuestion(`\nCombien de temps de préparation?  `);
        const ingredients = await askQuestion(`\nQuel sont les ingredients?  `);
        const steps = await askQuestion(`\nDécris les différentes étapes.  `);
        const category = await askQuestion(`\nQuel est la catégorie de ta recette?  `);
        const resultAdd = await connectionDB.query(`INSERT INTO recipes (title, nbr_people, time, ingredients, steps, category) 
            VALUES (? ,? , ?, ?, ?, ?)`, [title, nbrPeople, timePrepa, ingredients, steps, category]
        );
       console.log(`La recette ${title} à été ajoutée.`);      
    } catch (error) {
        console.error(`Erreur lors de l'ajout de la recette.`,error);
    }
}

async function updateRecipe() {

}

async function searchRecipe() {

}

async function importRecipe() {

}

async function exportRecipe() {

}

async function deleteRecipe() {

}

async function saveRecipe() {

}

function exit() {
    rl.close();
    connectionDB.end();
}

async function displayMenu() {
    console.log(chalk.blue.bold(`\n\nBienvenue dans ton carnet de recettes! Choisi une option: `));
    await wait(800);

    rl.question(`\n---------------------------------------------------------
        \n${chalk.blue("1.")} ${chalk.bold(`Affiche`)} toutes les recettes.
        \n${chalk.blue("2.")} ${chalk.green.bold(`Ajoute`)} une nouvelle recette.
        \n${chalk.blue("3.")} ${chalk.bold(`Modifie`)} une recette.
        \n${chalk.blue("4.")} ${chalk.bold(`Recherche`)} une recette que tu veux tester. 
        \n${chalk.blue("5.")} ${chalk.bold(`Importe`)} une recette.
        \n${chalk.blue("6.")} ${chalk.bold(`Exporte`)} une recette au format PDF.
        \n${chalk.blue("7.")} ${chalk.red.bold(`Supprime`)} une recette qui ne te plait pas.
        \n${chalk.blue("8.")} ${chalk.bold(`Sauvegarde.`)}
        \n${chalk.blue("9.")} ${chalk.blue.bold(`Quitter`)}\n\n---------------------------------------------------------\n
        `, (answer) => selectMenu(answer));
}

function selectMenu(answer) {
    switch (answer) {
        case `1`:
            seeAllRecipes();
            break;

        case `2`:
            addRecipe();
            break;   

        case `3`:
            updateRecipe();
            break; 

        case `4`:
            searchRecipe();
            break; 

        case `5`:
            importRecipe();
            break; 

        case `6`:
            exportRecipe();
            break; 

        case `7`:
            deleteRecipe();
            break; 

        case `8`:
            saveRecipe();
            break;

        case `9`:
            exit();
            break;

    default:
      console.log(`\nChoix invalide, recommence!!!\n`);
      displayMenu();     
    }
}

await testConnection();