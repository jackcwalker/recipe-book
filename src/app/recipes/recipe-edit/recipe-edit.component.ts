import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { recipeType, tags } from 'src/app/shared/recipeSets.model';
import { RecipeImage } from '../recipeImage.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable, combineLatest, map, startWith, switchMap} from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { v4 as uuidv4 } from 'uuid';
import { UiService } from 'src/app/shared/ui.service';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/shared/user.model';
import { Recipe } from '../recipe.model';
import { RecipeComment } from 'src/app/shared/recipeComment.model';

@Component({
    selector: 'app-recipe-edit',
    templateUrl: './recipe-edit.component.html',
    styleUrls: ['./recipe-edit.component.css'],
    standalone: false
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  images: RecipeImage[] = [];
  deletedImages: RecipeImage[] = [];
  imageIndex = 0;
  recipeTypes: string[] = Object.values(recipeType);
  allUsers: string[];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<string[]>;
  allTags: string[] = tags;
  currentImagePath: string;
  currentUsername: string;
  mobileLayout = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor(private route: ActivatedRoute, 
    private recipeService: RecipeService, 
    private router: Router, 
    private uiService: UiService,
    private userService: UserService) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filterTags(tag) : this.allTags.slice())),
    );
   }

  ngOnInit() {
    this.allUsers = this.userService.getAllUsers();

    this.route.params.pipe( switchMap( (params) => {
      this.editMode = params['route'] != null;
      return this.recipeService.getRecipe(params['route'])
      })).subscribe( (recipe: Recipe) => {
        this.initForm(recipe);
        this.getCurrentImagePath()
        this.setUserPermissions();
    });

    this.userService.currentUser$.subscribe((user: User)=>{
      this.currentUsername = user.name;
      this.setUserPermissions();
    })
    this.uiService.mobileLayout$.subscribe((mobileLayout: boolean) => {
      this.mobileLayout = mobileLayout;
      this.uiService.setFullScreen(mobileLayout);
    })
  }

  setUserPermissions() {
    if (this.currentUsername != null && this.recipeForm != null) {
      (<FormControl> this.recipeForm.get('author')).setValue(this.currentUsername);
      (<FormControl> this.recipeForm.get('author')).disable();
    }
  }

  private initForm(existingRecipe: Recipe) {
    let recipeName = '';
    let author = '';
    let serves: number;
    let cook: number;
    let prep: number;
    let comments: RecipeComment[] = [];
    let catagory = '';
    let notes = '';
    let route: string;
    let tags: string[] = [];
    let recipeImages = new FormArray([],imagesValidator);
    let recipeMethod = new FormArray([]);
    let recipeIngredients = new FormArray([]);
    
    if (this.editMode) {
      const recipe = existingRecipe;
      recipeName = recipe.name;
      this.images = recipe.images;
      author = recipe.author;
      serves = recipe.serves;
      cook = recipe.cook;
      prep = recipe.prep;
      catagory = recipe.catagory;
      notes = recipe.notes;
      if (recipe.comments){
        comments = recipe.comments;
      }
      if (recipe.tags){
        tags = recipe.tags;
      }
      route = recipe.route;
      if (recipe['images']) {
        for (let image of recipe.images) {
          image.toBeCreated = false;
          image.name = image.path;
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
      'name': new FormControl(recipeName, [
        Validators.required, 
        Validators.pattern('[a-zA-Z ]*'),
        nameExistsValidator(this.recipeService, this.editMode)
      ]),
      'author': new FormControl(author, Validators.required),
      'serves': new FormControl(serves, Validators.required),
      'cook': new FormControl(cook, Validators.required),
      'prep': new FormControl(prep, Validators.required),
      'catagory': new FormControl(catagory, Validators.required),
      'notes': new FormControl(notes),
      'tags': new FormControl(tags),
      'images': recipeImages,
      'method': recipeMethod,
      'ingredients': recipeIngredients,
      'route': new FormControl(route),
      'comments': new FormControl(comments),
    });
  }

  // ================= Submit/Cancel Related Methods =================

  onSubmit(){
    console.log('Edit Logger: Form Submitted');
    console.log(this.recipeForm.value);
    this.setRoute()
    const route = this.getRoute();
    this.uiService.createSnackBar('Submitting Recipe '+this.recipeForm.value.name);
    this.recipeService.setRecipe(this.recipeForm.getRawValue(), this.images.concat(this.deletedImages))
    .subscribe((snapshot) => {
      console.log('Edit Logger: Promise fulfilled');
      console.log(snapshot);
      this.uiService.closeSnackBar();
      this.uiService.createTimedSnackBar('Recipe Successfully Added',2);
      this.router.navigate(['/recipes/'+route],{
        queryParamsHandling: 'merge'
      });
  });
  }

  onCancel() {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }

  // ================= Image Related Methods =================

  onFileSelected(event) {
    for (let file of event.target.files) {
      console.log('Edit Logger: Image Uploaded');
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

  getCurrentImagePath() {
    const image = this.images[this.imageIndex];
    if (image) {
      if (image.toBeCreated) {
        this.currentImagePath = image.path;
      }
      else {
        return this.recipeService.getFullImagePath(this.getRoute(),image)
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
    const deletedImage = this.images[this.imageIndex];
    deletedImage.toBeDeleted = true;
    this.deletedImages.push(deletedImage)
    this.images.splice(this.imageIndex,1);
    (<FormArray>this.recipeForm.get('images')).removeAt(this.imageIndex);
    this.onPreviousImage()
  }
  // ================= Route Method Related Methods =================

  getRoute() {
    return (<FormControl> this.recipeForm.get('route')).value;
  }
  setRoute() {
    (<FormControl> this.recipeForm.get('route')).setValue(
      this.recipeService.formatRoute((<FormControl> this.recipeForm.get('name')).value.replace(/\s/g, '-'))
    );
  }
  // ================= Ingredient Method Related Methods =================

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

  get controlsIngredient() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  // ================= Recipe Method Related Methods =================

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

  get controlsMethod() {
    return (<FormArray>this.recipeForm.get('method')).controls;
  }

  // ================= Tag Related Methods =================

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

//================ Form Validation Functions ================
function nameExistsValidator(recipeService: RecipeService, editMode: boolean): ValidatorFn {
  return (control: FormControl): ValidationErrors | null => {
    if (editMode) {
      return null;
    } else {
      return recipeService.checkIfNameExists(control.value) ? {'nameExists': {value: control.value}} : null;
    }
  };
}

function imagesValidator(images: FormArray) {
  return images.value.length > 0 ? null : {'empty': true};
}