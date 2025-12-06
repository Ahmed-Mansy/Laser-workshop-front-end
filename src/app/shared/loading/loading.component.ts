import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.loading$ | async) {
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-8">
        <!-- Laser Pen -->
        <div class="laser-pen-container">
          <div class="laser-pen">
            <div class="pen-body"></div>
            <div class="pen-tip"></div>
            <div class="laser-beam"></div>
            <div class="laser-spark"></div>
          </div>
        </div>
        <div class="text-transparent bg-clip-text bg-gradient-to-r from-laser-500 via-fire-500 to-laser-500 font-black text-2xl animate-pulse">
          LASER CUTTING...
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .laser-pen-container {
      position: relative;
      width: 200px;
      height: 150px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .laser-pen {
      position: relative;
      animation: laser-pen-rotate 3s ease-in-out infinite;
    }

    .pen-body {
      width: 80px;
      height: 15px;
      background: linear-gradient(to right, #1e293b, #334155, #475569);
      border-radius: 10px 2px 2px 10px;
      box-shadow: 
        0 2px 10px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
    }

    .pen-body::before {
      content: '';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 10px #ef4444;
      animation: pulse 1s ease-in-out infinite;
    }

    .pen-tip {
      position: absolute;
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      border-left: 8px solid #94a3b8;
    }

    .laser-beam {
      position: absolute;
      right: -100px;
      top: 50%;
      transform: translateY(-50%);
      width: 100px;
      height: 2px;
      background: linear-gradient(to right, #22c55e, #10b981, transparent);
      box-shadow: 
        0 0 10px #22c55e,
        0 0 20px #22c55e,
        0 0 30px #22c55e;
      animation: beam-pulse 0.5s ease-in-out infinite alternate;
    }

    .laser-spark {
      position: absolute;
      right: -105px;
      top: 50%;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 
        0 0 20px #22c55e,
        0 0 40px #22c55e,
        0 0 60px #22c55e;
      animation: spark-glow 0.3s ease-in-out infinite;
    }

    @keyframes laser-pen-rotate {
      0%, 100% {
        transform: rotate(-15deg) translateY(0);
      }
      50% {
        transform: rotate(15deg) translateY(-10px);
      }
    }

    @keyframes beam-pulse {
      0% {
        opacity: 0.7;
        width: 100px;
      }
      100% {
        opacity: 1;
        width: 110px;
      }
    }

    @keyframes spark-glow {
      0%, 100% {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }
      50% {
        opacity: 0.6;
        transform: translateY(-50%) scale(1.3);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
