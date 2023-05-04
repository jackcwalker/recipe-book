import { Component,  ElementRef,  OnInit, ViewChild } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, startWith } from 'rxjs';

// Tag Imports
import { tags } from 'src/app/shared/recipeSets.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})

export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  nameSearch = '';

  // Tag OBjects
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<string[]>;
  allTags: string[] = tags;
  searchTags: string[] = [];
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor (private recipeService: RecipeService,
    private router: Router,
    public route: ActivatedRoute) {
  }

  ngOnInit() {
    
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filterTags(tag) : this.allTags.slice())),
    );

    combineLatest([
      this.route.queryParams,
      this.recipeService.recipes$
    ]).subscribe(([params, recipes]) => {
      this.recipes = (<Recipe[]> recipes);
      this.filteredRecipes = this.recipes;
      if (params['type'] != null){
        this.filteredRecipes = this.filteredRecipes.filter(recipe => recipe.catagory == params['type']);
      };
      if (params['name'] != null){
        this.filteredRecipes = this.filteredRecipes.filter(recipe => recipe.name.includes(params['name']));
      }
      if (params['tag'] != null){
        for (let tag of params['tag']){
          this.filteredRecipes = this.filteredRecipes.filter(recipe => {
            if (recipe.tags){
              return recipe.tags.includes(tag);
            }
          });
        }
      }
    });
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onNameFilter(nameSearch: string) {
    this.router.navigate(['/recipes'],
      {
        queryParams: { 'name': nameSearch },
        queryParamsHandling: 'merge' 
      }
    );
  }

  onTagFilter() {
    console.log('searching!')
    this.router.navigate(['/recipes'],
      {
        queryParams: { 'tag': this.searchTags },
        queryParamsHandling: 'merge' 
      }
    );
  }

    // ================= Tag Related Methods =================
  
    addTag(event: MatChipInputEvent): void {
      const value = (event.value || '').trim();
  
      // Add our tag
      if (value) {
        this.searchTags.push(value);
      }
  
      // Clear the input value
      event.chipInput!.clear();
  
      this.tagCtrl.setValue(null);
    }
  
    removeTag(tag: string): void {
      const index = this.searchTags.indexOf(tag);
  
      if (index >= 0) {
        this.searchTags.splice(index, 1);
      }
    }
  
    selectedTag(event: MatAutocompleteSelectedEvent): void {
      this.searchTags.push(event.option.viewValue);
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
    }
  
    private _filterTags(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
    }
}
