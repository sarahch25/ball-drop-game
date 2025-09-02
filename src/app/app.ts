import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout'; // <- נכון: layout.ts

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
