import {
  AfterViewInit, Component, ElementRef, EventEmitter,
  Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  templateUrl: './game-canvas.html',
  styleUrl: './game-canvas.scss'
})
export class GameCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvasEl', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /* If responsive=true, we ignore width/height inputs and fit to parent */
  @Input() responsive = true;
  @Input() aspect = 16 / 9;

  /* Fallback fixed size (used only when responsive=false) */
  @Input() width = 800;
  @Input() height = 600;

  @Input() movingHorizontally = true;
  @Input() isDropping = false;
  @Output() landed = new EventEmitter<{ x: number; distance: number; score: number }>();

  private ctx!: CanvasRenderingContext2D | null;
  private rafId = 0;
  private ro?: ResizeObserver;

  /* Ball state */
  private x = 50;
  private y = 30;
  private vx = 180;
  private vy = 0;
  private radius = 10;

  /* Physics */
  private g = 900;            /* px/sec^2 */
  private targetRadius = 30;
  private lastTs = 0;

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');

    if (this.responsive) {
      // Observe parent size and adapt canvas
      const parent = this.canvasRef.nativeElement.parentElement!;
      this.ro = new ResizeObserver(() => this.resizeToParent());
      this.ro.observe(parent);
      this.resizeToParent();   // initial
    } else {
      this.applyDpr();         // fixed size but scale for DPR
    }

    this.resetBall();
    this.loop(0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDropping'] && this.isDropping) this.vy = 0;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.ro?.disconnect();
  }

  /* ========== Responsive sizing ========== */

private resizeToParent(): void {
  const canvas = this.canvasRef.nativeElement;
  const parent = canvas.parentElement!;
  // נסה קודם getBoundingClientRect כדי להימנע מ-0 במצבים מסוימים
  const rect = parent.getBoundingClientRect();
  let cssWidth = Math.max(rect.width, parent.clientWidth);

  // fallback אם עדיין 0 (למשל בזמן טעינה): קחי 90vw
  if (!cssWidth || !isFinite(cssWidth)) {
    cssWidth = Math.floor(Math.min(window.innerWidth * 0.9, 1000));
  }

  const cssHeight = Math.round(cssWidth / this.aspect);

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  this.width = cssWidth;
  this.height = cssHeight;

  this.x = Math.min(Math.max(this.x, this.radius), this.width - this.radius);
  this.y = Math.min(Math.max(this.y, this.radius), this.height - this.radius);
}

  private applyDpr(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    // CSS size per inputs
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';
    // Internal buffer
    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ========== Game loop ========== */
  public resetGame(): void {
    this.isDropping = false;          /* מפסיק נפילה */
    this.movingHorizontally = true;   /* מחזיר תנועה אופקית */
    this.resetBall();                 /* מאפס מיקום ומהירות */
  }

  private resetBall(): void {
    /* לא אכפת לנו מ-X; העיקר שהכדור יחזור למעלה */
    this.y = this.radius + 2;   /* למעלה */
    this.vx = 180;              /* מהירות אופקית התחלתית */
    this.vy = 0;                /* בלי נפילה */
  }

  private loop = (ts: number) => {
    const dt = this.lastTs ? (ts - this.lastTs) / 1000 : 0;
    this.lastTs = ts;

    this.update(dt);
    this.draw();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (!this.ctx) return;

    const w = this.width;
    const h = this.height;
    const targetCenterX = w / 2;
    const groundY = h - 6;

    if (this.movingHorizontally && !this.isDropping) {
      this.x += this.vx * dt;
      if (this.x > w - this.radius) { this.x = w - this.radius; this.vx *= -1; }
      else if (this.x < this.radius) { this.x = this.radius; this.vx *= -1; }
    }

    if (this.isDropping) {
      this.vy += this.g * dt;
      this.y += this.vy * dt;

      if (this.y + this.radius >= groundY) {
        this.y = groundY - this.radius;
        this.isDropping = false;

        const distance = Math.abs(this.x - targetCenterX);
        const maxDist = w / 2;
        const score = Math.max(0, Math.round(100 - (distance / maxDist) * 100));

        this.landed.emit({ x: this.x, distance, score });
      }
    }
  }

  private clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private draw(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width, h = this.height;

    this.clear();

    /* Background */
    ctx.fillStyle = '#5cee27ff';
    ctx.fillRect(0, 0, w, h);

    /* Target (bottom centered) */
    const targetX = w / 2;
    const targetY = h - 6;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(targetX, targetY - this.targetRadius, this.targetRadius, 0, Math.PI, true);
    ctx.stroke();

    /* Ground line */
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h - 6);
    ctx.lineTo(w, h - 6);
    ctx.stroke();

    /* Ball */
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
