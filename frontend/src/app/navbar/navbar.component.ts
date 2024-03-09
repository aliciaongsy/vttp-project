import { Component, OnInit, inject } from '@angular/core';
import { DbStore } from '../service/db.store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  private store = inject(DbStore)

  loginStatus!: Observable<boolean>

  ngOnInit(): void {
    this.loginStatus = this.store.getStatus
    this.loginStatus.subscribe((value) => console.info(value))
  }
}
