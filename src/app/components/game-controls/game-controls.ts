import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.html',
  styleUrls: ['./game-controls.scss']
})
export class GameControlsComponent {
  @Input() canDrop = true;
  @Output() drop = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onDropClick(): void { this.drop.emit(); }
  onResetClick(): void { this.reset.emit(); }
}
