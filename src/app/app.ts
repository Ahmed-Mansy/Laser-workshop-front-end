import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { LoadingComponent } from './shared/loading/loading.component';
import { DeveloperFooterComponent } from './shared/developer-footer/developer-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, LoadingComponent, DeveloperFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Laser Workshop';
}
