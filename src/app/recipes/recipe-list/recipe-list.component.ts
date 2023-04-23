import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent {
  recipes: Recipe[] = [
    new Recipe('Homemade Kebab', 'This is simply biryani', 'https://geekrobocook.com/wp-content/uploads/2021/05/Muradabadi-chicken-biryani-1200x900.jpg'),
    new Recipe('Naomis Hiccup Curry', 'This is simply noodles', 'https://www.licious.in/blog/wp-content/uploads/2020/12/Sesame-Chicken-Noodles.jpg'),
    new Recipe('Pina Colado Smoothie', 'This is simply noodles', 'https://images.immediate.co.uk/production/volatile/sites/30/2013/11/pina-colada-c68aca7.jpg')
  ];
}
