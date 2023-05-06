import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-recipe-start',
  templateUrl: './recipe-start.component.html',
  styleUrls: ['./recipe-start.component.css']
})
export class RecipeStartComponent {
  constructor(
    private route: ActivatedRoute,
    private uiService: UiService
  ) {}
  ngOnInit(): void {
    this.route.params
    .subscribe((params) => {
      if (params['route'] == null){
        this.uiService.setFullScreen(false);
      }
    })
  }
}
