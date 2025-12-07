import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';

interface ShowcaseImage {
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './showcase.html',
  styleUrl: './showcase.css'
})
export class ShowcaseComponent implements OnInit, OnDestroy {
  showcaseImages: ShowcaseImage[] = [
    {
      title: 'Precision Wood Engraving',
      description: 'Intricate laser-cut wooden sign with custom design',
      imageUrl: 'showcase/sample1.jpg',
      category: 'Wood'
    },
    {
      title: 'Metal Art Panel',
      description: 'Decorative metal panel with geometric patterns',
      imageUrl: 'showcase/sample2.jpg',
      category: 'Metal'
    },
    {
      title: 'Acrylic Display',
      description: 'Custom acrylic signage with LED backlighting',
      imageUrl: 'showcase/sample3.jpg',
      category: 'Acrylic'
    },
    {
      title: 'Leather Crafting',
      description: 'Detailed leather engraving for premium products',
      imageUrl: 'showcase/sample4.jpg',
      category: 'Leather'
    }
  ];

  currentSlide = signal(0);
  isAutoPlaying = signal(true);
  private autoPlayInterval: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide.set((this.currentSlide() + 1) % this.showcaseImages.length);
  }

  previousSlide(): void {
    const current = this.currentSlide();
    this.currentSlide.set(current === 0 ? this.showcaseImages.length - 1 : current - 1);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.resetAutoPlay();
  }

  startAutoPlay(): void {
    if (this.isAutoPlaying()) {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000); // Change slide every 5 seconds
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  toggleAutoPlay(): void {
    this.isAutoPlaying.set(!this.isAutoPlaying());
    if (this.isAutoPlaying()) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousSlide();
      this.resetAutoPlay();
    } else if (event.key === 'ArrowRight') {
      this.nextSlide();
      this.resetAutoPlay();
    }
  }
}
