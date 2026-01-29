import { ChatComponent } from "./pages/chat/chat.component";
import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { AppLayoutComponent } from "./components/app-layout/app-layout.component";
import { SignUpComponent } from "./pages/auth/sign-up/signup.component";
import { UsersComponent } from "./pages/users/users.component";
import { AuthGuard } from "./guards/auth.guard";
import { AccessDeniedComponent } from "./pages/access-denied/access-denied.component";
import { AutenticateViewComponent } from "./pages/autenticate-view/autenticate-view.component";
import { AdminRoleGuard } from "./guards/admin-role.guard";
import { GuestGuard } from "./guards/guest.guard";
import { IRoleType } from "./interfaces";
import { ProfileComponent } from "./pages/profile/profile.component";
import { PublicationsComponent } from "./pages/publications/publications.component";
import { SalesViewComponent } from "./pages/sales-view/sales-view.component";
import { OauthCallbackComponent } from "./pages/oauth-callback/oauth-callback.component";
import { RoleSelectionComponent } from "./pages/role-selection/role-selection.component";
import { AuctionsViewComponent } from "./pages/auctions-view/auctions-view.component";
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { ShoppingCartComponent } from "./pages/shopping-cart/shopping-cart.component";
import { RoleGuard } from "./guards/role.guard";
import { PaymentStatusComponent } from "./pages/payment-status/payment-status.component";
import { ModelsComponent } from "./pages/models/models.component";
import { VeterinaryAppointmentComponent } from "@app/pages/appointment/veterinary-appointment/veterinary-appointment.component";
import { BillsComponent } from "@app/pages/bills/bills.component";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "role-selection",
    component: RoleSelectionComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "oauth/callback",
    component: OauthCallbackComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "signup",
    component: SignUpComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "autenticate",
    component: AutenticateViewComponent,
  },
  {
    path: "",
    redirectTo: "landing-page",
    pathMatch: "full",
  },
  {
    path: "landing-page",
    component: LandingPageComponent,
  },
  {
    path: "app",
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        redirectTo: "users",
        pathMatch: "full",
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin],
          name: "Usuarios",
          icon: "fa-users",
          showInSidebar: true,
        },
      },
      {
        path: "publications",
        component: PublicationsComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.seller,
          ],
          name: "Publicaciones",
          icon: "fa-table-list",
          showInSidebar: true,
        },
      },
      {
        path: "sales",
        component: SalesViewComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.buyer],
          name: "Ventas",
          icon: "fa-cart-plus",
          showInSidebar: true,
        },
      },
      {
        path: "auctions",
        component: AuctionsViewComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.buyer],
          name: "Subastas",
          icon: "fa-money-bill-trend-up",
          showInSidebar: true,
        },
      },
      {
        path: "3d-model",
        component: ModelsComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.buyer,
            IRoleType.seller,
          ],
          name: "predicción 3D",
          icon: "fa-arrow-trend-up",
          showInSidebar: true,
        },
      },
      {
        path: "profile",
        component: ProfileComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.buyer,
            IRoleType.seller,
          ],
          name: "Perfil",
          icon: "fa-user",
          showInSidebar: false,
        },
      },
      {
        path: "chat-bot",
        component: ChatComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [IRoleType.buyer, IRoleType.superAdmin],
          name: "Chat Interactivo",
          icon: "fa-comments",
          showInSidebar: true,
        },
      },
      {
        path: "shopping-cart",
        component: ShoppingCartComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [IRoleType.buyer, IRoleType.admin, IRoleType.superAdmin],
          name: "Carrito de compra",
          icon: "fa-cart-shopping",
          showInSidebar: true,
        },
      },
      {
        path: "bills",
        component: BillsComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [IRoleType.buyer, IRoleType.admin, IRoleType.superAdmin],
          name: "Historial de facturas",
          icon: "fa-solid fa-clock-rotate-left",
          showInSidebar: true,
        },
      },
      {
        path: "paypal",
        children: [
          { path: "success", component: PaymentStatusComponent },
          { path: "error", component: PaymentStatusComponent },
          { path: "cancel", component: PaymentStatusComponent },
        ],
      },
      {
        path: "appointment",
        component: VeterinaryAppointmentComponent,
        canActivate: [RoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.buyer,
            IRoleType.seller,
          ],
          name: "Citas veterinarios",
          icon: "fa-paw",
          showInSidebar: true,
        },
      },
    ],
  },
];
