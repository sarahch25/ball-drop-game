import { Component , ViewChild } from '@angular/core';
import { GameCanvasComponent } from '../../components/game-canvas/game-canvas';
import { GameControlsComponent } from '../../components/game-controls/game-controls';
import { ScoreDisplayComponent } from '../../components/score-display/score-display';

@Component({
  selector: 'app-game-page',
  standalone: true,
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  imports: [
    GameCanvasComponent,
    GameControlsComponent,
    ScoreDisplayComponent
  ]
})
export class GamePageComponent {
  @ViewChild(GameCanvasComponent) canvas!: GameCanvasComponent;
  canvasW = 600;
  canvasH = 400;
  movingHorizontally = true;
  isDropping = false;
  score = 0;
  lastDistance = 0;

  onDrop() {
    this.isDropping = true;
    this.movingHorizontally = false;
  }

   onReset(): void {
    this.canvas.resetGame();
    this.isDropping = false;       /* משקף להורה כדי שהכפתורים יתעדכנו */
    this.movingHorizontally = true;
  }

   /* כשהכדור נחת */
  onLanded(e: { x: number; distance: number; score: number }): void {
    this.lastDistance = e.distance;
    this.score = e.score;
    this.isDropping = false;       /* הכדור סיים ליפול */
    this.movingHorizontally = false; /* נשאר עומד עד Reset */
  }
}
