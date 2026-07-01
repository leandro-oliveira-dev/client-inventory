/**
 * Componente de captura de assinatura desenhada (Parte 10).
 *
 * Renderiza um `<canvas>` no qual o usuário desenha a assinatura com o mouse ou
 * o toque. Exporta o traço como data URL PNG (`toDataURL()`), informa se está
 * vazio (`isEmpty()`) e permite limpar (`clear()`). É reutilizável — a tela de
 * assinatura o usa duas vezes (ADMIN e CLIENTE).
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  template: `
    <div class="pad" [class.pad--disabled]="disabled">
      <canvas
        #canvas
        class="pad__canvas"
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp()"
        (pointerleave)="onUp()"
      ></canvas>
      @if (empty()) {
        <span class="pad__hint">Assine no quadro acima</span>
      }
    </div>
  `,
  styles: [
    `
      .pad {
        position: relative;
        border: 1px dashed var(--border);
        border-radius: 10px;
        background: #ffffff;
        overflow: hidden;
        touch-action: none;
      }
      .pad--disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      .pad__canvas {
        display: block;
        width: 100%;
        height: 150px;
        cursor: crosshair;
      }
      .pad__hint {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #94a3b8;
        font-size: 0.85rem;
        pointer-events: none;
      }
    `,
  ],
})
export class SignaturePadComponent implements AfterViewInit {
  /** Desabilita o desenho (ex.: após assinar). */
  @Input() disabled = false;

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Indica se o quadro está vazio (para exibir a dica). */
  readonly empty = signal(true);

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    // Ajusta a resolução do canvas ao seu tamanho renderizado.
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b';
      this.ctx = ctx;
    }
  }

  /** Inicia um traço. */
  onDown(event: PointerEvent): void {
    if (this.disabled || !this.ctx) {
      return;
    }
    this.drawing = true;
    const { x, y } = this.point(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
  }

  /** Continua o traço enquanto o ponteiro se move. */
  onMove(event: PointerEvent): void {
    if (!this.drawing || !this.ctx) {
      return;
    }
    const { x, y } = this.point(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    if (this.empty()) {
      this.empty.set(false);
    }
  }

  /** Encerra o traço. */
  onUp(): void {
    this.drawing = false;
  }

  /** Limpa o quadro. */
  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.empty.set(true);
  }

  /** Verifica se o quadro está vazio. */
  isEmpty(): boolean {
    return this.empty();
  }

  /** Exporta o traço como data URL PNG, ou `null` se vazio. */
  toDataURL(): string | null {
    if (this.empty()) {
      return null;
    }
    return this.canvasRef.nativeElement.toDataURL('image/png');
  }

  /** Converte as coordenadas do ponteiro para o espaço do canvas. */
  private point(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }
}
