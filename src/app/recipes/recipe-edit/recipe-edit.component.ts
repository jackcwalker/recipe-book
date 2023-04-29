import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { recipeType } from 'src/app/shared/recipeType';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  fileName: string;
  uploadFileName: string;
  recipeTypes: string[] = Object.values(recipeType);

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router, private dataStorageService: DataStorageService) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
        }
      );
    this.dataStorageService.fileUploaded
      .subscribe(
        (fileName: string) => {
          this.recipeForm.get('imagePath').setValue(fileName);
          this.uploadFileName = this.recipeService.getFullImagePath(fileName);
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
    let recipeImagePath = '';
    let recipeMethod = new FormArray([]);
    let recipeIngredients = new FormArray([]);
    
    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      if (recipe['method']) {
        for (let step of recipe.method) {
          recipeIngredients.push(
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
      'imagePath': new FormControl(recipeImagePath, Validators.required),
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
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onCancel() {
    if (this.fileName) {
      this.dataStorageService.deleteFile(this.fileName);
    }
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onFileSelected(event) {
    const file:File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const formData = new FormData();
      formData.append("image", file);
      this.dataStorageService.uploadFile(this.fileName,file)
    }
  }

  get controlsMethod() {
    return (<FormArray>this.recipeForm.get('method')).controls;
  }

  get controlsIngredient() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

}