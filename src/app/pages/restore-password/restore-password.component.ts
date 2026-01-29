import { Component, inject, Output, ViewChild } from '@angular/core';
import { RestorePasswordFormComponent } from '../../components/user/restore-password-from/restore-password-form.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../../interfaces';
import { SignUpComponent } from '../auth/sign-up/signup.component';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-restore-password',
  standalone: true,
  imports: [
    ModalComponent,
    LoaderComponent,
    RestorePasswordFormComponent,
    SignUpComponent,
    CommonModule,
],
  templateUrl: './restore-password.component.html',
  styleUrl: './restore-password.component.scss'
})
export class RestorePasswordComponent {
  public userService: UserService = inject(UserService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addUsersModal') public addUsersModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  public keyword: string = '';

  userForm = this.fb.group({
    id: [''],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    failedAttempts: [0],
    lockTime: [null],
    authorities: [[]],
  });

  constructor() {
    this.userService.search.page = 1;
    this.userService.getAll();
  }

  callEdition(user: IUser) {
    this.userForm.controls['id'].setValue(user.id ? JSON.stringify(user.id) : '');
    this.userForm.controls['password'].setValue('');
    this.userForm.controls['confirmPassword'].setValue('');
    this.modalService.displayModal('md', this.addUsersModal);
  } 

  updateUser(user: IUser) {
    this.userService.update(user);
    this.modalService.closeAll();
  }
}
