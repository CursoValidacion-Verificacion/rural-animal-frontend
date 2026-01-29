import { Component, inject, Output, ViewChild } from '@angular/core';
import { UserListComponent } from '../../components/user/user-list/user-list.component';
import { UserFormComponent } from '../../components/user/user-from/user-form.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../../interfaces';
import { SignUpComponent } from '../auth/sign-up/signup.component';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    UserListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    UserFormComponent,
    SignUpComponent,
    CommonModule,
],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  public userService: UserService = inject(UserService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addUsersModal') public addUsersModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  public showSignUp: boolean = false;
  public showTable: boolean = false; 
  public keyword: string = '';

  userForm = this.fb.group({
    id: [''],
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    lastName1: ['', Validators.required],
    lastName2: [''],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required], 
    birthDate: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    state: ['Inactive'],
    province: [''],
    canton: [''],
    district: [''],
    otherDetails: [''],
    vco: ['', Validators.required],
    identification: ['', Validators.required],
    role: [null, Validators.required],
    failedAttempts: [0],
    lockTime: [null],
    authorities: [[]],
  });

  constructor() {
    this.userService.search.page = 1;
    this.userService.getAll();
  }

  // Alterna entre el listado y el formulario de registro
  toggleSignUp() {
    this.showSignUp = !this.showSignUp;
    this.showTable = !this.showTable;
  }

  saveUser(user: IUser) {
    this.userService.save(user);
    this.modalService.closeAll();
  }

  callEdition(user: IUser) {
    this.userForm.controls['id'].setValue(user.id ? JSON.stringify(user.id) : '');
    this.userForm.controls['email'].setValue(user.email ? JSON.stringify(user.email) : '');
    this.userForm.controls['name'].setValue(user.name ? JSON.stringify(user.name) : '');
    this.userForm.controls['lastName1'].setValue(user.lastName1 ? JSON.stringify(user.lastName1) : '');
    this.userForm.controls['lastName2'].setValue(user.lastName2 ? JSON.stringify(user.lastName2) : '');
    this.userForm.controls['identification'].setValue(user.identification ? JSON.stringify(user.identification) : '');
    this.userForm.controls['vco'].setValue(user.vco ? JSON.stringify(user.vco) : '');
    this.userForm.controls['birthDate'].setValue(user.birthDate ? JSON.stringify(user.birthDate) : '');
    this.userForm.controls['phoneNumber'].setValue(user.phoneNumber ? JSON.stringify(user.phoneNumber) : '');
    this.userForm.controls['state'].setValue(user.state ? JSON.stringify(user.state) : '');
    this.userForm.controls['province'].setValue(user.direction?.province ? JSON.stringify(user.direction.province) : '');
    this.userForm.controls['canton'].setValue(user.direction?.canton ? JSON.stringify(user.direction.canton) : '');
    this.userForm.controls['district'].setValue(user.direction?.district ? JSON.stringify(user.direction.district) : '');
    this.userForm.controls['otherDetails'].setValue(user.direction?.otherDetails ? JSON.stringify(user.direction.otherDetails) : '');
    this.userForm.controls['password'].setValue(''); // Resetea la contraseña o deja vacía si es necesario
    this.userForm.controls['confirmPassword'].setValue('');
    this.modalService.displayModal('md', this.addUsersModal);
  } 

  updateUser(user: IUser) {
    this.userService.update(user);
    this.modalService.closeAll();
  }

  deleteUser(user: IUser) {
    this.userService.delete(user);
  }

  filterUsers(){
    this.userService.filterUsers(this.keyword);
  }

  setKeyword(keyword: string){
    this.keyword = keyword;
    if (this.userService.search.page != null) {
      this.filterUsers();
    }
  }
}
