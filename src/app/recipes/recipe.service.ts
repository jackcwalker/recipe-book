import { Recipe } from "./recipe.model";

export class RecipeService {
    private  recipes: Recipe[] = [
        new Recipe('Chicken Biryani', 'This is simply biryani', 'https://geekrobocook.com/wp-content/uploads/2021/05/Muradabadi-chicken-biryani-1200x900.jpg'),
        new Recipe('Chicken noodles', 'This is simply noodles', 'https://www.licious.in/blog/wp-content/uploads/2020/12/Sesame-Chicken-Noodles.jpg')
    ];

    getRecipes () {
        return this.recipes.slice();
    }
}