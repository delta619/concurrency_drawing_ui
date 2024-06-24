import { Routes } from '@angular/router';
import { CanvasComponent } from './canvas/canvas.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '', component:HomeComponent, pathMatch: 'full'
    },
    {
        path: ':screenID', component: CanvasComponent, pathMatch: 'full'
    },
    {
        path: "**", redirectTo: '', pathMatch: 'full'
    }
];
