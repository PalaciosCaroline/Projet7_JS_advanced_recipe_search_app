import {recipes} from '../data/recipes.js';
import {quickSort, getStringForCompare} from '../utils/sortrecipes.js';
import {displayRecipes} from '../factories/buildCard.js';
import {noRecipeAlert, removeNoRecipeAlert, isAlert} from '../factories/alertnorecipe.js';
import {boxresultsUl, buildUlListfilter, inputList, btnList, boxresults} from '../factories/buildListForTag.js';
import {displayTag} from '../factories/buildtag.js';

let recipesSort = quickSort(recipes, 0, recipes.length - 1);
let datas = {}
datas.recipes = [...recipesSort]

let datasProxy = new Proxy(datas, {
    set: function(target, key, value) {
        target[key] = value;
        switch(key) {
            case 'filtredRecipes': 
                if ( datasProxy.filtredRecipes.length == 0){
                    noRecipeAlert();
                } else {
                    if(isAlert){
                    removeNoRecipeAlert();
                    }
                    displayRecipes(value);
                    //mise a jour des listes de choix de tags
                    getIngredientsList(value);
                    getApplianceList(value);
                    getUstensilsList(value);
                    getChosenTag();
                }
            break;
            case 'searchString': {
                //filtrage des recettes avec search_bar
                const result = searchRecipeBySearchBar(value);
                //actualisation des recettes filtrées
                datasProxy.filtredRecipes = [...result];
                //filtrage par tag
                searchByTag();
            break;
            }
            case 'searchTag' : 
                //creation tag
                displayTag(datasProxy.searchTag);
                //filtrage en fonction des tag
                searchByTag();
                removeTag();
                //filtrage par searchbar
                if(datas.searchString?.length > 2){
                        const result = searchRecipeBySearchBar(datas.searchString);
                        datasProxy.filtredRecipes = [...result];
                }
            break;
        }
        return true;
    }
});

datasProxy.filtredRecipes = [...recipesSort]; 

document.querySelector('#search_bar').addEventListener('input', (e) => {
    datasProxy.searchString = e.target.value;
    datasProxy.searchLength = e.target.value.length ?? 0;
})

function removeInputList(ArrayList,index){
    if (inputList[index].value == ''){
        buildUlListfilter(ArrayList, boxresultsUl[index]);
        getChosenTag();
    }
}

function getIngredientsList(recipes){
    let ingredientsArray = [];
    recipes.forEach((recipe) => {
        recipe.ingredients.map((element) => ingredientsArray.push(element.ingredient.toLowerCase()));
    ingredientsArray = [...new Set(ingredientsArray)].sort();
    buildUlListfilter(ingredientsArray, boxresultsUl[0]);
    })    

    inputList[0].addEventListener('input', (e) => {
        let research = e.target.value;
        let newIngredientsArray = ingredientsArray.filter(item => getStringForCompare(item).includes(getStringForCompare(research)));
        buildUlListfilter(newIngredientsArray, boxresultsUl[0]);
        getChosenTag();
    })

    boxresults[0].addEventListener('focusin', () => {removeInputList(ingredientsArray,0)})
    btnList[0].addEventListener('click', () => {removeInputList(ingredientsArray,0)})
}

function getApplianceList(recipes){
    let applianceArray = [];
    recipes.forEach((recipe) => {
        applianceArray.push(recipe.appliance.toLowerCase());
    applianceArray = [...new Set(applianceArray)].sort();
    buildUlListfilter(applianceArray, boxresultsUl[1]);
    })

    inputList[1].addEventListener('input', (e) => {
        let research = e.target.value;
        let newApplianceArray = applianceArray.filter(item => getStringForCompare(item).includes(getStringForCompare(research)));
        buildUlListfilter(newApplianceArray, boxresultsUl[1]);
        getChosenTag();
    })

    boxresults[1].addEventListener('focusin', () => {removeInputList(applianceArray,1)})
    btnList[1].addEventListener('click', () => {removeInputList(applianceArray,1)})
}

function getUstensilsList(recipes){
    let ustensilsArray = [];
    recipes.forEach((recipe) => {
    recipe.ustensils.map((element) => ustensilsArray.push(element.toLowerCase()));
    ustensilsArray = [...new Set(ustensilsArray)].sort();
    buildUlListfilter(ustensilsArray, boxresultsUl[2]);
    })

    inputList[2].addEventListener('input', (e) => {
        let research = e.target.value;
        let newUstensilsArray = ustensilsArray.filter(item => getStringForCompare(item).includes(getStringForCompare(research)));
        buildUlListfilter(newUstensilsArray, boxresultsUl[2]);
        getChosenTag();
    })

    boxresults[2].addEventListener('focusin', () => {removeInputList(ustensilsArray,2)})
    btnList[2].addEventListener('click', () => {removeInputList(ustensilsArray,2)})
}

function getChosenTag() {
    const liSortingItem = document.querySelectorAll('.liSorting-item')
    liSortingItem.forEach(item => item.addEventListener('click', (e) => {
        let tag = {};
        tag.value = e.target.textContent;
        tag.type = e.target.parentNode.id;
        if(e.target.parentNode.id == 'ingredientsUl'){
            inputList[0].value = '';
        } else if(e.target.parentNode.id == 'applianceUl'){
            inputList[1].value = '';
        } else if(e.target.parentNode.id == 'ustensilsUl'){
            inputList[2].value = '';
        }
        datasProxy.searchTag = datasProxy.searchTag?.length > 0 ? [...datasProxy.searchTag,tag] : [tag] ;
    }))   
}

function removeTag(){
    const btnCloses = document.querySelectorAll('.btnClose');
    for(let i = 0; i < datasProxy.searchTag?.length; i++){
        btnCloses[i].addEventListener('click', function() {
            datasProxy.filtredRecipes = [...recipesSort];
            datasProxy.searchTag = datasProxy.searchTag.length > 1 ? [...datasProxy.searchTag.slice(0, i), ...datasProxy.searchTag.slice(i + 1)] : [];
        })
    } 
}

//function intermédiaire de recherche par tag 
function filterRecipeByIngredients(tag){
    const resultTag = datasProxy.filtredRecipes.filter(recipe  => recipe.ingredients.filter(item =>
        item.ingredient.toLowerCase().includes(tag.value.toLowerCase())).length > 0)
        datasProxy.filtredRecipes = [...resultTag];
}

//function intermédiaire de recherche par tag   
function filterRecipeByAppliance(tag){
    const resultTag = datasProxy.filtredRecipes.filter(recipe => recipe.appliance.toLowerCase().includes(tag.value.toLowerCase()));
    datasProxy.filtredRecipes = [...resultTag];
}
    
//function intermédiaire de recherche par tag 
function filterRecipeByUstensils(tag){
    const resultTag = datasProxy.filtredRecipes.filter(recipe => recipe.ustensils.filter(item => 
    item.toLowerCase().includes(tag.value.toLowerCase())).length > 0)
    datasProxy.filtredRecipes = [...resultTag];
}

function searchByTag() {
    datasProxy.searchTag?.forEach(tag => {
        if(tag.type == 'ingredientsUl'){
            filterRecipeByIngredients(tag);
        } else if(tag.type == 'applianceUl'){
            filterRecipeByAppliance(tag);
        } else if (tag.type == 'ustensilsUl'){
            filterRecipeByUstensils(tag);
        }
    })
}

//function intermédiaire de recherche searchbar
function ingredientIsHere(recipe, value){
    for (let i = 0; i < recipe.ingredients.length; i++) {
        if(getStringForCompare(recipe.ingredients[i].ingredient).includes(value)){
            return true;
        }
    }
    return false;
}

//function intermédiaire de recherche searchbar
function searchStringInAllRecipe(research,arrayOfRecipe,arrayOfResult){
    research = getStringForCompare(research);
    for (let i = 0; i < arrayOfRecipe.length; i++) {
        let recipe = arrayOfRecipe[i];
        let name = getStringForCompare(recipe.name);
        let description = getStringForCompare(recipe.description);
        if (name.includes(research)) {
            arrayOfResult.push(recipe); 
        } else if ( ingredientIsHere(recipe, research)){
            arrayOfResult.push(recipe);
        } else if (description.includes(research)) {
            arrayOfResult.push(recipe);
        }
    }
    return arrayOfResult;
}

function searchRecipeBySearchBar(research) {
    let result = [];
    if(research.length >= datasProxy.searchLength && research.length > 2) {
        return searchStringInAllRecipe(research,datasProxy.filtredRecipes,result);
    } else if (research.length < datasProxy.searchLength && research.length > 2) {
        return searchStringInAllRecipe(research,datasProxy.recipes,result);
    } else {
        const result = [...recipesSort];
        return result;
    }
}



