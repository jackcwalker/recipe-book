import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { recipeType } from 'src/app/shared/recipeType';
import { tags } from 'src/app/shared/recipeTags.model';
import { RecipeImage } from '../recipeImage.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable, map, startWith} from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  images: RecipeImage[] = [];
  deletedImages: RecipeImage[] = [];
  imageIndex = 0;
  recipeTypes: string[] = Object.values(recipeType);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  allTags: string[] = tags;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router, private dataStorageService: DataStorageService) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filterTags(tag) : this.allTags.slice())),
    );
   }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
        }
      );
    this.recipeService.recipesChanged.subscribe(
        () => {
          this.initForm();
        }
      )
  }

  private initForm() {
    let recipeName = '';
    let author = '';
    let serves: number;
    let cook: number;
    let prep: number;
    let catagory = '';
    let recipeImages = new FormArray([]);
    let recipeMethod = new FormArray([]);
    let recipeIngredients = new FormArray([]);
    
    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      this.images = recipe.images;
      author = recipe.author;
      serves = recipe.serves;
      cook = recipe.cook;
      prep = recipe.prep;
      catagory = recipe.catagory;
      if (recipe['images']) {
        for (let image of recipe.images) {
          recipeImages.push(
            new FormGroup({
              'path': new FormControl(image.path, Validators.required)
            })
          );
        }
      }
      if (recipe['method']) {
        for (let step of recipe.method) {
          recipeMethod.push(
            new FormGroup({
              'description': new FormControl(step.description, Validators.required)
            })
          );
        }
      }
      if (recipe['ingredients']) {
        for (let ingredient of recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required)
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'author': new FormControl(author, Validators.required),
      'serves': new FormControl(serves, Validators.required),
      'cook': new FormControl(cook, Validators.required),
      'prep': new FormControl(prep, Validators.required),
      'catagory': new FormControl(catagory, Validators.required),
      'images': recipeImages,
      'method': recipeMethod,
      'ingredients': recipeIngredients
    });
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onAddMethod() {
    (<FormArray>this.recipeForm.get('method')).push(
      new FormGroup({
        'description': new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteMethod(index: number) {
    (<FormArray>this.recipeForm.get('method')).removeAt(index);
  }

  onSubmit(){
    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, this.recipeForm.value);
    } else {
      this.recipeService.addRecipe(this.recipeForm.value);
    }
    this.updateImages();
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  updateImages(){
    console.log('Logger: Updating Images');
    for (let image of this.images) {
      if (image.toBeCreated) {
        console.log('Logger: Uploading'+image.name);
        this.dataStorageService.uploadFile(image.name,image.file);
      }
    }
    for (let image of this.deletedImages) {
      if (!image.toBeCreated) {
        console.log('Logger: Deleting'+image.name);
        this.dataStorageService.deleteFile(image.name);
      }
    }
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      console.log('Logger: File Uploaded');
      const newImage = new RecipeImage(URL.createObjectURL(file));
      newImage.file = file;
      newImage.name = file.name;
      newImage.toBeCreated = true;
      this.images.push(newImage);

      (<FormArray>this.recipeForm.get('images')).push(
        new FormGroup({
          'path': new FormControl(file.name, Validators.required)
        })
      );
      this.onNextImage()
    }
  }

  getCurrentImage() {
    return this.images[this.imageIndex];
  }

  getCurrentImagePath() {
    if (this.getCurrentImage().toBeCreated) {
      return this.getCurrentImage().path;
    }
    else {
      return this.recipeService.getFullImagePath(this.getCurrentImage().path);
    }
  }

  onPreviousImage() {
    if (this.imageIndex-1 >= 0){
      this.imageIndex = this.imageIndex-1;
    } else {
      this.imageIndex = 0;
    }
  }

  onNextImage() {
    if (this.imageIndex+1 <= this.images.length-1){
      this.imageIndex = this.imageIndex+1;
    } else {
      this.imageIndex = 0;
    }
  }

  onDeleteImage() {
    this.deletedImages.push(this.images[this.imageIndex])
    this.images.splice(this.imageIndex,1);
    (<FormArray>this.recipeForm.get('images')).removeAt(this.imageIndex);
    this.onPreviousImage()
  }

  get controlsMethod() {
    return (<FormArray>this.recipeForm.get('method')).controls;
  }

  get controlsIngredient() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }
}