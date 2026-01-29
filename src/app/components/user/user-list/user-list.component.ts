import { ProfileService } from "./../../../services/profile.service";
import { UserService } from "@app/services/user.service";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  OnChanges,
} from "@angular/core";
import { AuthService } from "../../../services/auth.service";
import { AlertService } from "../../../services/alert.service";
import { IUser } from "../../../interfaces";
import { CommonModule } from "@angular/common";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ProfileComponent } from "@app/pages/profile/profile.component";
import { FormsModule } from "@angular/forms";
import {ModalService} from '@app/services/modal.service';
import {ModalComponent} from '@app/components/modal/modal.component';
import { Subject, debounceTime } from "rxjs";

interface ApiResponse {
  message: string;
}

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, ProfileComponent, FormsModule, ModalComponent],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
})
export class UserListComponent implements OnChanges{
  @Input() title: string = "";
  @Input() users: IUser[] = [];
  @Output() callModalAction: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callDeleteAction: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() keyword: EventEmitter<string> = new EventEmitter<string>();

  public profileService = inject(ProfileService);
  public modalService: ModalService = inject(ModalService);
  public profileFilterService = inject(AuthService);

  filteredUsers: IUser[] = [];
  searchTerm: string = "";
  showDeleteModal: boolean = false;
  userToDelete: IUser | null = null;
  showTable: boolean = true;
  selectedUser: IUser | null = null;
  searchSubject: Subject<string> = new Subject();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private userService: UserService
  ) {}

  ngOnChanges() {
    this.filterUsers();
  }

  filterUsers() {
    const loggedInUserId = this.authService.getUser()?.id;
    if (this.users){
      this.filteredUsers = [...this.users.filter(
        (user) => user.id !== loggedInUserId
      )]
    }
  }

  applyFilter(event: Event) {
    this.searchSubject.pipe(debounceTime(300000)).subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
    });

    this.searchTerm = (event.target as HTMLInputElement).value.trim(); 
    this.keyword.emit(this.searchTerm);
  }

  editUser(user: IUser) {
    this.selectedUser = user;
    this.showTable = false;
  }

  cancelEdit() {
    this.showTable = true; 
    this.selectedUser = null; 
  }


  confirmDelete(user: IUser): void {
    if (user) {
      this.userService.delete(user);
    }
  }

  toggleUserState(user: IUser) {
    const newState: "Active" | "Inactive" =
      user.state === "Active" ? "Inactive" : "Active";

    this.userService.updateUserStatus(user, newState).subscribe(
      (updatedUser) => {
        // Actualiza el estado del usuario en la lista
        user.state = updatedUser.state;
        this.alertService.displayAlert(
          "success",
          `El estado del usuario cambió a ${newState}!`
        );
      },
      (error) => {
        this.alertService.displayAlert(
          "error",
          "Error al actualizar el estado."
        );
        console.error("Error al actualizar el estado:", error);
      }
    );
  }
}
