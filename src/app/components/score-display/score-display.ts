import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-score-display',
  standalone: true,
  templateUrl: './score-display.html',
  styleUrl: './score-display.scss',
  imports: [DecimalPipe]   
})
export class ScoreDisplayComponent {
  @Input() score = 0;
  @Input() lastDistance = 0;
}
