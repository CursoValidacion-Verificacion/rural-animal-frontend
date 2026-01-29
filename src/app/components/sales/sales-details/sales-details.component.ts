import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IPublication } from "@app/interfaces";
import { AnimalStageViewerComponent } from "@app/components/animal/animal-stage-viewer/animal-stage-viewer.component";

@Component({
  selector: "app-sales-details",
  standalone: true,
  imports: [CommonModule, AnimalStageViewerComponent],
  templateUrl: "./sales-details.component.html",
  styleUrls: ["./sales-details.component.scss"],
})
export class SalesDetailsComponent {
  @Input() publication!: IPublication;
  @Input() isInCart: boolean = false;
  @Output() addToCart = new EventEmitter<IPublication>();
  @Output() goToCart = new EventEmitter<void>();

  currentIndex: number = 0;
  showModelViewer: boolean = false;
  modelPath: string = "";

  onAddToCart(): void {
    if (this.isInCart) {
      this.goToCart.emit();
    } else {
      this.addToCart.emit(this.publication);
    }
  }

  prev(): void {
    if (this.publication.photos) {
      this.currentIndex =
        (this.currentIndex - 1 + this.publication.photos.length) %
        this.publication.photos.length;
    }
  }

  next(): void {
    if (this.publication.photos) {
      this.currentIndex =
        (this.currentIndex + 1) % this.publication.photos.length;
    }
  }

  openModelViewerModal() {
    const basePath = `../../../../assets/models/${this.publication.specie}/${this.publication.race}`;
    this.modelPath = `${basePath}/adulto.glb`;
    this.showModelViewer = true;
  }

  closeModelViewerModal() {
    this.showModelViewer = false;
  }
}
