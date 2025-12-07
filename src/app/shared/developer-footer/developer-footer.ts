import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
    selector: 'app-developer-footer',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './developer-footer.html',
    styleUrl: './developer-footer.css'
})
export class DeveloperFooterComponent {
    // No logic needed for now, purely presentational
}
