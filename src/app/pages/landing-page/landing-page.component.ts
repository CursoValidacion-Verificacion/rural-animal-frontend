import {Component, inject, OnInit} from "@angular/core";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "@app/services/auth.service";

@Component({
    selector: "app-landing-page",
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: "./landing-page.component.html",
    styleUrl: "./landing-page.component.scss",
})
export class LandingPageComponent implements OnInit {
    private authService: AuthService = inject(AuthService);

    ngOnInit() {
        this.authService.logout();
    }
}
