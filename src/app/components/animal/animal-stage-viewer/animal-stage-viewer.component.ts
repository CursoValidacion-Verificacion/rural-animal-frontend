import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ModelLoaderService } from "../../../services/model-loader.service";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

@Component({
  selector: "app-animal-stage-viewer",
  standalone: true,
  imports: [],
  templateUrl: "./animal-stage-viewer.component.html",
  styleUrls: ["./animal-stage-viewer.component.scss"],
})
export class AnimalStageViewerComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() modelPath!: string;
  @Input() publication!: any; // Add the publication input property

  @ViewChild("rendererContainer", { static: false })
  rendererContainer!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  showModelViewer: boolean = false;

  constructor(private modelLoader: ModelLoaderService) {}

  ngAfterViewInit() {
    if (this.rendererContainer) {
      this.initThree();
      this.loadModel();
      window.addEventListener("resize", this.onWindowResize.bind(this));
    } else {
      console.error("Renderer container not found!");
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["modelPath"] && !changes["modelPath"].isFirstChange()) {
      this.clearScene(); // Limpia el modelo actual
      this.loadModel(); // Carga el nuevo modelo
    }
  }

  ngOnDestroy() {
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    this.renderer.dispose(); // Libera el renderizador
    this.controls.dispose(); // Libera los controles
    this.clearScene();
  }

  private initThree() {
    const container = this.rendererContainer.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1, 5);

    // Luz direccional sin sombras
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    light.castShadow = false;
    this.scene.add(light);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    // Configuración de controles
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Habilita el suavizado
    this.controls.dampingFactor = 0.25; // Suaviza el movimiento
    this.controls.screenSpacePanning = false; // Deshabilita el paneo en el espacio de la pantalla
    this.controls.maxPolarAngle = Math.PI / 2;

    // Deshabilitar sombras en el renderer
    this.renderer.shadowMap.enabled = false;
  }

  private loadModel() {
    this.modelLoader
      .loadModel(this.modelPath)

      .then((model) => {
        this.removeLightsFromModel(model);
        this.scene.add(model);
        this.centerCamera(model);
        this.animate();
        this.adjustModelMaterials(model);
        this.scene.add(model);
      })
      .catch((error) => {
        console.error("Error loading model: ", error);
      });
  }

  private adjustModelMaterials(model: THREE.Group) {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Deshabilitar sombras
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        // Ajustar el material
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.shadowSide = null; // Desactiva cualquier lado sombreado
              mat.needsUpdate = true;
            }
          });
        } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.shadowSide = null;
          mesh.material.needsUpdate = true;
        }
      }
    });
  }

  private removeLightsFromModel(model: THREE.Group) {
    model.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        model.remove(child);
      }
    });
  }

  private centerCamera(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / Math.tan(fov / 2)) * 1.2;

    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.camera.lookAt(center);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    // Actualizar controles
    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  private clearScene() {
    this.scene.clear(); // Limpia toda la escena, incluyendo luces.
    this.addBaseLights(); // Vuelve a agregar luces necesarias sin sombras.
  }

  private addBaseLights() {
    // Luz direccional básica sin sombras
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    light.castShadow = false;
    this.scene.add(light);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
  }

  private onWindowResize() {
    const container = this.rendererContainer.nativeElement;
    this.camera.aspect = container.offsetWidth / container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  openModelViewerModal() {
    const basePath = `assets/models/${this.publication.specie}/${this.publication.race}`; // Absolute path
    this.modelPath = `${basePath}/adulto.glb`;
    this.showModelViewer = true;
  }
}
