import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="login-container">
      <h1>Inventário App</h1>
      <p>Tela de login será implementada na Parte 2.</p>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {}
