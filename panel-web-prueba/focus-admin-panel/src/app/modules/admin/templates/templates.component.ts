import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplatesService } from '../../../core/services/templates.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Templates works</p>`
})
export class TemplatesComponent {
  constructor(
    private templatesService: TemplatesService,
    private auth: AuthService
  ) {}
}