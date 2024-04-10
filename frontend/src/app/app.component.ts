import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthStatus } from './state/planner/planner.selector';
import { resetAuthStatus } from './state/planner/planner.actions';
import { GoogleService } from './service/google.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  private store = inject(Store)
  private googleSvc = inject(GoogleService)

  ngOnInit(): void {
    // reset google login status in store after 1 hr
    this.store.select(selectAuthStatus).subscribe(
      (status) => {
        if(status){
          setTimeout(() => {
            this.googleSvc.revokeToken()
            this.store.dispatch(resetAuthStatus())
          }, 3600000)
        }
    })
  }
}
