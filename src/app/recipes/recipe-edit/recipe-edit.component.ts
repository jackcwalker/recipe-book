import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { recipeType, tags } from 'src/app/shared/recipeSets.model';
import { RecipeImage } from '../recipeImage.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable, combineLatest, map, startWith} from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { v4 as uuidv4 } from 'uuid';
import { UiService } from 'src/app/shared/ui.service';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/shared/user.model';

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
  allUsers: string[];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<string[]>;
  allTags: string[] = tags;
  currentImagePath: string;
  currentUser: User;

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
    combineLatest([
      this.route.params,
      this.recipeService.recipes$
    ]).subscribe(([params, recipes]) => {
      this.id = this.recipeService.getRecipeIndex(params['route']);
      this.editMode = params['route'] != null;
      this.initForm();
      this.getCurrentImagePath()
    })
    this.userService.currentUser$.subscribe((user: User)=>{
      this.currentUser = user;
    })
  }

  private initForm() {
    let recipeName = '';
    let author = '';
    let serves: number;
    let cook: number;
    let prep: number;
    let catagory = '';
    let notes = '';
    let route: string;
    let tags: string[] = [];
    let recipeImages = new FormArray([],imagesValidator);
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
    
    let authorControl = new FormControl(author, Validators.required);
    if (!this.editMode && this.currentUser){
      authorControl = new FormControl({value: this.currentUser.name, disabled: true}, Validators.required);
    }
    

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, [
        Validators.required, 
        Validators.pattern('[a-zA-Z ]*'),
        nameExistsValidator(this.recipeService, this.editMode)
      ]),
      'author': authorControl,
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
    });
  }

  // ================= Routing Related Methods =================

  onSubmit(){
    console.log('Edit Logger: Form Submitted');
    this.setRoute()
    const route = this.getRoute();
    console.log(this.recipeForm.value);
    this.uiService.createSnackBar('Submitting Recipe');
    this.recipeService.fetchRecipes().subscribe(() => {
      if (this.editMode) {
        this.recipeService.updateRecipe(this.recipeForm.value, this.images.concat(this.deletedImages))
        .then((snapshot) => {
          console.log('Edit Logger: Promise fulfilled');
          console.log(snapshot);
          this.uiService.closeSnackBar();
          this.router.navigate(['../'], {relativeTo: this.route});
      });
      } else {
        this.recipeService.addRecipe(this.recipeForm.value, this.images.concat(this.deletedImages))
        .then((snapshot) => {
          console.log('Edit Logger: Promise fulfilled');
          console.log(snapshot);
          this.uiService.closeSnackBar();
          this.router.navigate(['/recipes/'+route]);
      });
      }
    })
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
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