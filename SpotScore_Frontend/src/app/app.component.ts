import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements AfterViewInit {
  @ViewChild('logoCanvas', { static: false }) logoCanvas!: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.logoCanvas) {
        this.init3DLogo();
      } else {
        console.error("Canvas element not found!");
      }
    }, 100); // Slight delay to ensure element is available
  }

  title = 'SpotScore_Frontend';
  source:string='assets/Logo.png';
  isLoggedIn!: boolean;
  constructor(public auth:AuthService,private translate: TranslateService) {
    console.log('AppComponent initialized');

    translate.addLangs(['en', 'bs']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang() || 'en'; // Postavi default ako je undefined
    translate.use(['en', 'bs'].includes(browserLang) ? browserLang : 'en');
    
  }

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  logOut(){
    this.auth.signOut();
  }
  selectedLanguage: string = 'en';

  switchLanguage(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedLanguage = isChecked ? 'bs' : 'en';
    this.translate.use(this.selectedLanguage);
    console.log("Switched Language:", this.selectedLanguage);
  }
  
// 3D LOGO
// model.rotation.set(Math.PI / 2, 0, 0.5);

init3DLogo() {
  const canvas = this.logoCanvas.nativeElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const loader = new GLTFLoader();
  loader.load('assets/Logo.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.4, 0.4, 0.4); 
    model.position.set(0, 0, 0);
    model.rotation.set(Math.PI / 2, 0, 0.5);

    // Add Soft Shadows
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        // Enhance Material for a Polished Look
        if (node.material) {
          node.material.metalness = 0.5;  // Slight metallic effect
          node.material.roughness = 0.2;  // Smooth finish
          node.material.envMapIntensity = 1.2; // Enhances reflections
        }
      }
    });

    scene.add(model);

    let rotationSpeed = 0.008; // Slower for a refined effect
    let floatSpeed = 0.0018; // Smooth floating motion
    let floatAmplitude = 0.12; // Slightly higher floating

    function animate() {
      requestAnimationFrame(animate);

      // Refined smooth Z-axis rotation
      model.rotation.z += rotationSpeed;

      // Smooth floating motion
      model.position.y = Math.sin(Date.now() * floatSpeed) * floatAmplitude;

      renderer.render(scene, camera);
    }

    animate();
  }, undefined, (error) => {
    console.error("Error loading 3D model:", error);
  });

  // **Enhanced Lighting Setup**
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1.2);
  spotLight.position.set(5, 5, 5);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(-3, 3, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x88ccff, 1, 4); // Cool blue accent light
  pointLight.position.set(1, 2, 2);
  scene.add(pointLight);
}



}
