import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
interface Category {
  id: string;
  name: string;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() categories!: Category[]; // Use a specific type instead of 'any[]'
}
