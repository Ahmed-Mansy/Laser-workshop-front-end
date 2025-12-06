import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ContactDialogComponent } from '../../../shared/contact-dialog/contact-dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatDialogModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);

  get features() {
    return [
      {
        icon: 'fa-boxes',
        title: this.languageService.translate('home.features.orderManagement.title'),
        description: this.languageService.translate('home.features.orderManagement.description')
      },
      {
        icon: 'fa-chart-line',
        title: this.languageService.translate('home.features.financialReports.title'),
        description: this.languageService.translate('home.features.financialReports.description')
      },
      {
        icon: 'fa-users',
        title: this.languageService.translate('home.features.teamCollaboration.title'),
        description: this.languageService.translate('home.features.teamCollaboration.description')
      },
      {
        icon: 'fa-images',
        title: this.languageService.translate('home.features.showcaseGallery.title'),
        description: this.languageService.translate('home.features.showcaseGallery.description')
      }
    ];
  }

  openContactDialog(): void {
    this.dialog.open(ContactDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container'
    });
  }
}
