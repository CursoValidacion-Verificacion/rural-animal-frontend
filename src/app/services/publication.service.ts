import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IPublication, ISearch } from "@app/interfaces";
import { AlertService } from "./alert.service";
import { AuthService } from "./auth.service";
import { string } from "three/src/nodes/tsl/TSLCore";

@Injectable({
  providedIn: "root",
})
export class PublicationService extends BaseService<IPublication> {
  protected override source: string = "publications";
  private publicationListSignal = signal<IPublication[]>([]);
  private salesListSignal = signal<IPublication[]>([]);
  private auctionsListSignal = signal<IPublication[]>([]);
  private authService: AuthService = inject(AuthService);
  private filters: Record<string, string> = {
    type: "",
    search: "",
    sort: "",
  };

  get publications$() {
    return this.publicationListSignal;
  }

  get sales$() {
    return this.salesListSignal;
  }

  get auctions$() {
    return this.auctionsListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 6,
    totalPages: 0,
    totalElements: 0,
    pageNumber: 0,
  };

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );
        this.publicationListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("error", err);
      },
    });
  }

  getAllByUser(filters: { type?: string; search?: string; sort?: string }) {
    this.findAllWithParamsAndCustomSource(
      `user/${this.authService.getUser()?.id}/publications`,
      {
        page: this.search.page,
        size: this.search.size,
        type: filters.type || "",
        search: filters.search || "",
        sort: filters.sort || "",
      }
    ).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          ...response.meta,
          pageNumber: response.meta.pageNumber,
        };

        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );

        this.publicationListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("Error cargando las publiaciones filtradas: ", err);
      },
    });
  }

  //Función que selecciona las publicaciones dependiendo del rol
  selectUser(filters: Record<string, string>) {
    console.log("Estoy aqui");
    if (
      this.authService.getUser()?.role?.title == "SUPER_ADMIN" ||
      this.authService.getUser()?.role?.title == "ADMIN"
    ) {
      this.getFilteredPublications(filters);
    } else {
      this.getAllByUser(filters);
    }
  }

  save(publication: IPublication) {
    this.add(publication).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          "success",
          response.message,
          "center",
          "top",
          ["success-snackbar"]
        );
        this.selectUser(this.filters);
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Un error ha ocurrido al crear la publicación",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("error", err);
      },
    });
  }

  update(publication: IPublication, message: string) {
    this.patchCustomSource(`${publication.id}`, publication).subscribe({
      next: (response: any) => {
        const message = "Información actualizada con éxito";
        this.alertService.displayAlert("success", message, "center", "top", [
          "success-snackbar",
        ]);
        //this.selectUser;
        this.selectUser(this.filters);
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar la publicación. Por favor intenta más tarde",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("error", err);
      },
    });
  }

  getSalesPublications() {
    this.findAllWithParamsAndCustomSource("sales", {
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          ...response.meta,
          pageNumber: response.meta.pageNumber,
        };
        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );

        this.salesListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("Error al cargar las publicaciones de 'Venta':", err);
      },
    });
  }

  getAuctionsPublications() {
    this.findAllWithParamsAndCustomSource("auctions", {
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: any) => {
        this.search = {
          ...this.search,
          ...response.meta,
          pageNumber: response.meta.pageNumber,
        };
        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );

        this.auctionsListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("Error al cargar las publicaciones de 'Subasta':", err);
      },
    });
  }

  getFilteredPublications(filters: {
    type?: string;
    search?: string;
    sort?: string;
  }) {
    // Llamar al endpoint `/filtered`
    this.findAllWithParamsAndCustomSource("filtered", {
      page: this.search.page,
      size: this.search.size,
      type: filters.type || "",
      search: filters.search || "",
      sort: filters.sort || "",
    }).subscribe({
      next: (response: any) => {
        // Actualizar los metadatos de búsqueda
        this.search = {
          ...this.search,
          ...response.meta,
          pageNumber: response.meta.pageNumber,
        };

        // Actualizar la paginación
        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );

        // Actualizar las publicaciones filtradas
        this.publicationListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("Error cargando las publicaciones filtradas: ", err);
      },
    });
  }
}
