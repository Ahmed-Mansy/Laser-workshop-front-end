import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ShowcaseImage {
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './showcase.html',
  styleUrl: './showcase.css'
})
export class ShowcaseComponent implements OnInit {
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

  currentSlide = 0;
  isAutoPlaying = true;
  private autoPlayInterval: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.showcaseImages.length;
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0
      ? this.showcaseImages.length - 1
      : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  startAutoPlay(): void {
    if (this.isAutoPlaying) {
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
    this.isAutoPlaying = !this.isAutoPlaying;
    if (this.isAutoPlaying) {
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
