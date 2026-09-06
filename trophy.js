/* ============================================================
   El Camino al Lombardi — visor 3D del Trofeo Vince Lombardi
   Requiere Three.js (cargado vía import map en index.html) y debe
   servirse por HTTP/HTTPS: los módulos ES no cargan desde file://
   ============================================================ */
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";

  var container = document.getElementById("trophyStage");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f19);

  var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 10);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  var dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(10, 10, 15);
  dirLight.castShadow = true;
  scene.add(dirLight);
  var pointLight = new THREE.PointLight(0x013369, 3, 35);
  pointLight.position.set(-10, 5, -10);
  scene.add(pointLight);

  var trophyMaterial = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.95, roughness: 0.15 });
  var trophyGroup = new THREE.Group();

  var baseGeometry = new THREE.CylinderGeometry(0.8, 1.4, 3.5, 32);
  var baseMesh = new THREE.Mesh(baseGeometry, trophyMaterial);
  baseMesh.position.y = -0.75;
  baseMesh.rotation.y = Math.PI / 4;
  trophyGroup.add(baseMesh);

  var ballGeometry = new THREE.SphereGeometry(1.1, 32, 32);
  var ballMesh = new THREE.Mesh(ballGeometry, trophyMaterial);
  ballMesh.scale.set(1, 1.4, 1);
  ballMesh.position.y = 2.0;
  ballMesh.rotation.z = Math.PI / 6;
  trophyGroup.add(ballMesh);
  scene.add(trophyGroup);

  var vectorBall = new THREE.Vector3(0, 2.2, 0);
  var vectorBase = new THREE.Vector3(0, -0.75, 0);
  var vectorMaterial = new THREE.Vector3(0.5, -1.8, 0.5);

  function updateHotspots(){
    var widthHalf = container.clientWidth / 2;
    var heightHalf = container.clientHeight / 2;
    function updatePosition(vector, elementId){
      var el = document.getElementById(elementId);
      if(!el) return;
      var v = vector.clone();
      v.project(camera);
      var x = (v.x * widthHalf) + widthHalf;
      var y = -(v.y * heightHalf) + heightHalf;
      el.style.left = x + "px";
      el.style.top = y + "px";
    }
    updatePosition(vectorBall, "hs-ball");
    updatePosition(vectorBase, "hs-base");
    updatePosition(vectorMaterial, "hs-material");
  }

  window.toggleHotspot = function(id, event){
    if(event) event.stopPropagation();
    document.querySelectorAll(".hotspot").forEach(function(item){
      if(item.id !== id) item.classList.remove("active");
    });
    var target = document.getElementById(id);
    if(target) target.classList.toggle("active");
  };
  renderer.domElement.addEventListener("click", function(){
    document.querySelectorAll(".hotspot").forEach(function(item){ item.classList.remove("active"); });
  });
  document.getElementById("btn-reset").addEventListener("click", function(){
    camera.position.set(0, 0, 10);
    trophyGroup.rotation.set(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.reset();
  });

  var userInteracting = false;
  renderer.domElement.addEventListener("pointerdown", function(){ userInteracting = true; });
  window.addEventListener("pointerup", function(){ userInteracting = false; });

  function onResize(){
    var w = container.clientWidth, h = container.clientHeight;
    if(w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  if(window.ResizeObserver){ new ResizeObserver(onResize).observe(container); }
  else { window.addEventListener("resize", onResize); }

  var stageVisible = true;
  if(window.IntersectionObserver){
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){ stageVisible = e.isIntersecting; });
    }, { threshold: 0 }).observe(container);
  }

  function animate(){
    requestAnimationFrame(animate);
    if(!stageVisible) return;
    if(!userInteracting && !reduceMotion){ trophyGroup.rotation.y += 0.003; }
    controls.update();
    renderer.render(scene, camera);
    updateHotspots();
  }
  animate();
