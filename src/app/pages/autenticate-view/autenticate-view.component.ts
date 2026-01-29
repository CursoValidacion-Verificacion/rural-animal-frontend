import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: "app-autenticate-view",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./autenticate-view.component.html",
  styleUrl: "./autenticate-view.component.scss",
})
export class AutenticateViewComponent implements OnInit {
  public userService: UserService = inject(UserService);
  userId: string | null = null;
  isAuthenticated: boolean = false;
  errorMessage: string | null = null;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParamMap.get('id');
    if (this.userId) {
      this.authenticate(Number(this.userId));
    } else {
      this.errorMessage = 'No se proporcionó un ID válido para autenticar.';
    }
  }

  authenticate(userId: number): void {
    this.userService.addCustomSource("emailConfirm", userId).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.errorMessage = null;
      },
      error: (err: any) => {
        this.isAuthenticated = false;
        this.errorMessage = 'Ocurrió un error al verificar el correo. Por favor intenta más tarde.';
        console.error('Error en autenticación:', err);
      }
    });
  }
}
