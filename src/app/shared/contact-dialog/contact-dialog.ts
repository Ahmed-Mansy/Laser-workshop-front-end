import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
    selector: 'app-contact-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
    templateUrl: './contact-dialog.html',
    styleUrl: './contact-dialog.css'
})
export class ContactDialogComponent {
    constructor(public dialogRef: MatDialogRef<ContactDialogComponent>) { }

    contactMethods = [
        {
            icon: 'fa-linkedin',
            label: 'LinkedIn',
            color: 'from-blue-600 to-blue-500',
            hoverColor: 'hover:shadow-blue-500/50',
            link: 'https://www.linkedin.com/in/ahmed-ali-753961209/',
            external: true
        },
        {
            icon: 'fa-whatsapp',
            label: 'WhatsApp',
            color: 'from-green-600 to-green-500',
            hoverColor: 'hover:shadow-green-500/50',
            link: 'https://wa.me/01068012263',
            external: true
        },
        {
            icon: 'fa-facebook',
            label: 'Facebook',
            color: 'from-blue-700 to-blue-600',
            hoverColor: 'hover:shadow-blue-600/50',
            link: 'https://www.facebook.com/Ahmed23mansy/',
            external: true
        },
        {
            icon: 'fa-envelope',
            label: 'Email',
            color: 'from-red-600 to-red-500',
            hoverColor: 'hover:shadow-red-500/50',
            link: 'mailto:ahmed8mansy@gmail.com',
            external: false
        }
    ];

    close(): void {
        this.dialogRef.close();
    }

    openLink(link: string): void {
        window.open(link, '_blank');
    }
}
