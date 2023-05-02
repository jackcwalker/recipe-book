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
import { v4 as uuidv4 } from 'uuid';

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
  //tags: string[] = [];
  allTags: string[] = tags;
  currentImagePath: string;

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
          this.getCurrentImagePath()
        }
      );
    this.recipeService.recipesChanged.subscribe(
        () => {
          this.initForm();
          this.getCurrentImagePath()
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
    let notes = '';
    let tags: string[] = [];
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
      notes = recipe.notes;
      tags = recipe.tags;
      if (recipe['images']) {
        for (let image of recipe.images) {
          image.toBeCreated = false;
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
      'notes': new FormControl(notes),
      'tags': new FormControl(tags),
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
    this.updateImages();
    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, this.recipeForm.value);
    } else {
      this.recipeService.addRecipe(this.recipeForm.value);
    }
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  updateImages(){
    console.log('Logger: Updating Images');
    for (let image of this.images) {
      console.log(image);
      if (image.toBeCreated) {
        const newImagePath = this.recipeService.getRecipeRoute(this.getCurrentRecipeName() + '/' + image.name);
        console.log('Logger: Uploading new image to '+newImagePath);
        this.dataStorageService.uploadFile(newImagePath,image.file);
      }
    }
    for (let image of this.deletedImages) {
      if (!image.toBeCreated) {
        console.log('Logger: Deleting image: '+this.recipeService.getRecipeRoute(this.getCurrentRecipeName() + '/' + image.path));
        this.dataStorageService.deleteFile(this.recipeService.getRecipeRoute(this.getCurrentRecipeName() + '/' + image.path));
      }
    }
  }

  getCurrentRecipeName(){
    return (<FormControl> this.recipeForm.get('name')).value;
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      console.log('Logger: File Uploaded');
      const newImage = new RecipeImage(URL.createObjectURL(file));
      newImage.file = file;
      newImage.name = uuidv4() +'.' + file.name.split('.').pop();
      newImage.toBeCreated = true;
      this.images.push(newImage);

      (<FormArray>this.recipeForm.get('images')).push(
        new FormGroup({
          'path': new FormControl(newImage.name, Validators.required)
        })
      );
      this.onNextImage()
    }
  }

  getCurrentImage() {
    return this.images[this.imageIndex];
  }

  getCurrentImagePath() {
    const image = this.getCurrentImage();
    if (image) {
      if (image.toBeCreated) {
        this.currentImagePath = image.path;
      }
      else {
        return this.recipeService.getFullImagePath(this.getCurrentRecipeName(),image)
        .then((value) => {this.currentImagePath = value ? value : null});
      }
    }
  }

  onPreviousImage() {
    if (this.imageIndex-1 >= 0){
      this.imageIndex = this.imageIndex-1;
    } else {
      this.imageIndex = 0;
    }
    this.getCurrentImagePath();
  }

  onNextImage() {
    if (this.imageIndex+1 <= this.images.length-1){
      this.imageIndex = this.imageIndex+1;
    } else {
      this.imageIndex = 0;
    }
    this.getCurrentImagePath();
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

  getTags() {
    return (<FormControl> this.recipeForm.get('tags')).value;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.getTags().push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.getTags().indexOf(tag);

    if (index >= 0) {
      this.getTags().splice(index, 1);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.getTags().push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }
}