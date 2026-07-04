/**
 * Clove Dental Care - Main JavaScript Application
 * Includes interactive UI features, appointment booking logic, and a Three.js 3D tooth scene
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSpecializedServices();
  initBookingForm();
  initTestimonialCarousel();
  initFaqAccordion();
  initThreeJsTooth();
});

/* ==========================================================================
   THEME TOGGLING (Dark & Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  // Retrieve theme preference from localStorage or check system setting (default to dark)
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch a custom event to notify the Three.js renderer of a theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  });
}

/* ==========================================================================
   NAVIGATION LOGIC (Sticky Header, Mobile Menu, Active State)
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navLinksList = document.querySelectorAll('.nav-links a');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? '&#10005;' : '&#9776;';
  });

  // Close mobile menu when a link is clicked
  navLinksList.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.innerHTML = '&#9776;';
    });
  });

  // Active section indicator using IntersectionObserver
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksList.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   APPOINTMENT BOOKING FORM LOGIC (Multi-step & Validations)
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('appointmentForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  
  const dot1 = document.getElementById('stepDot1');
  const dot2 = document.getElementById('stepDot2');
  const dot3 = document.getElementById('stepDot3');
  
  const btnNext1 = document.getElementById('btnNext1');
  const btnPrev2 = document.getElementById('btnPrev2');
  const btnReset = document.getElementById('btnReset');
  
  const dateInput = document.getElementById('appointmentDate');
  const timeSlots = document.querySelectorAll('.time-slot');
  const selectedSlotInput = document.getElementById('selectedSlot');
  
  // Set minimum date to today (no booking in the past)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  // Time slot selection
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedSlotInput.value = slot.getAttribute('data-slot');
    });
  });

  // Step 1 Validation & Proceed
  btnNext1.addEventListener('click', () => {
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    
    if (!name || !phone || !email) {
      alert('Please fill out all required personal details fields.');
      return;
    }
    
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Go to step 2
    step1.classList.remove('active');
    step2.classList.add('active');
    dot2.classList.add('active');
  });

  // Step 2 Go Back
  btnPrev2.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
    dot2.classList.remove('active');
  });

  // Submit Booking Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const treatment = document.getElementById('treatmentType').value;
    const date = dateInput.value;
    const timeSlot = selectedSlotInput.value;
    
    if (!treatment || !date || !timeSlot) {
      alert('Please select a Treatment, Date, and Time Slot.');
      return;
    }

    // Simulate API booking request
    const btnSubmit = document.getElementById('btnSubmit');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Booking Slot...';

    setTimeout(() => {
      // Get details for confirmation message
      const name = document.getElementById('fullName').value.trim();
      const treatmentSelect = document.getElementById('treatmentType');
      const treatmentText = treatmentSelect.options[treatmentSelect.selectedIndex].text;
      
      // Format Date nicely
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      // Update Confirmation Screen
      document.getElementById('confirmedName').textContent = name;
      document.getElementById('confirmedTreatment').textContent = treatmentText;
      document.getElementById('confirmedTime').textContent = `${formattedDate} at ${timeSlot}`;

      // Transition to Step 3 (Success)
      step2.classList.remove('active');
      step3.classList.add('active');
      dot3.classList.add('active');

      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }, 1200);
  });

  // Reset/Book another appointment
  btnReset.addEventListener('click', () => {
    form.reset();
    timeSlots.forEach(s => s.classList.remove('selected'));
    selectedSlotInput.value = '';
    
    step3.classList.remove('active');
    step1.classList.add('active');
    dot2.classList.remove('active');
    dot3.classList.remove('active');
  });
}

/* ==========================================================================
   PATIENT TESTIMONIALS CAROUSEL
   ========================================================================== */
function initTestimonialCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const btnPrev = document.getElementById('carouselBtnPrev');
  const btnNext = document.getElementById('carouselBtnNext');
  const dotsContainer = document.getElementById('carouselDots');
  const dots = Array.from(dotsContainer.children);

  let currentIndex = 0;
  let autoplayTimer;

  function updateCarousel(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  btnPrev.addEventListener('click', () => {
    updateCarousel(currentIndex - 1);
    startAutoplay();
  });

  btnNext.addEventListener('click', () => {
    updateCarousel(currentIndex + 1);
    startAutoplay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      updateCarousel(index);
      startAutoplay();
    });
  });

  // Track hover to pause autoplay
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Initialize
  startAutoplay();
}

/* ==========================================================================
   FAQ ACCORDION LOGIC
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other FAQ items
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-toggle-icon').textContent = '+';
      });

      if (!isActive) {
        item.classList.add('active');
        item.querySelector('.faq-toggle-icon').textContent = '−'; // Minus sign
      }
    });
  });
}

/* ==========================================================================
   THREE.JS INTERACTIVE 3D TOOTH MODEL RENDERER
   ========================================================================== */
function initThreeJsTooth() {
  const container = document.getElementById('canvasContainer');
  const fallback = document.getElementById('heroFallback');
  
  if (!container || typeof THREE === 'undefined') {
    // If container not found or Three.js CDN failed to load, display fallback image
    if (fallback) fallback.style.opacity = '1';
    return;
  }

  // Setup scene, camera, renderer
  const scene = new THREE.Scene();
  
  // Responsive Camera Aspect Ratio
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Hide fallback image once WebGL canvas is appended and ready
  if (fallback) fallback.style.opacity = '0';

  // STUDIO LIGHTING
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Key light from top right
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  // Soft fill light from bottom left
  const dirLight2 = new THREE.DirectionalLight(0x76b896, 0.5); // Hint of mint green
  dirLight2.position.set(-5, -5, 2);
  scene.add(dirLight2);

  // Rim back glow light
  const pointLight = new THREE.PointLight(0x10b981, 1.5, 10); // Cyan/emerald glow
  pointLight.position.set(0, 0, -2);
  scene.add(pointLight);

  // PROCEDURAL 3D MOLAR TOOTH GEOMETRY GENERATOR
  function createToothGeometry() {
    // Subdivided box geometry offers clean lines to deform into tooth anatomy
    const geom = new THREE.BoxGeometry(1.3, 1.6, 1.3, 12, 16, 12);
    const pos = geom.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      
      // CROWN (Top part of tooth, Y > 0.15)
      if (y > 0.15) {
        // Create 4 distinct rounded crown cusps at the corners of the molar
        const distFromCenter = Math.sqrt(x*x + z*z);
        
        // Cusp heights based on quadrants (X & Z offsets)
        const cuspX = Math.sin(x * Math.PI * 0.7);
        const cuspZ = Math.sin(z * Math.PI * 0.7);
        const cuspHeight = cuspX * cuspZ * 0.18;
        
        y += cuspHeight;
        
        // Create central groove (dip in middle)
        y -= (0.25 - distFromCenter) * 0.08;
        // General top curvature
        y -= (x*x + z*z) * 0.08;
      }
      
      // NECK & ROOTS (Middle and bottom, Y <= 0.15)
      if (y <= 0.15) {
        // Linear interpolation factor from bottom (y=-0.8) to neck (y=0.15)
        let t = (y + 0.8) / 0.95; 
        t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]
        
        // Narrow the neck slightly (waist effect)
        if (y > -0.1) {
          const neckFactor = (y + 0.1) / 0.25; // 0 to 1
          const narrow = 0.88 + 0.12 * neckFactor;
          x *= narrow;
          z *= narrow;
        }
        
        // Split and shape double roots for molar (below Y = -0.1)
        if (y <= -0.1) {
          // X-axis separation center
          const rootCenterOffset = x > 0 ? 0.38 : -0.38;
          
          // Smoothly separate points towards the root centers as we go down
          x = x * t + rootCenterOffset * (1 - t);
          
          // Taper root tips at the very bottom
          const taper = 0.2 + 0.8 * t;
          x *= taper;
          z *= taper;
        }
      }
      
      pos.setXYZ(i, x, y, z);
    }
    
    // Recalculate vertex normals for smooth cinematic reflections
    geom.computeVertexNormals();
    return geom;
  }

  const toothGeometry = createToothGeometry();

  // PREMIUM GLOSSY TRANSLUCENT PORCELAIN MATERIAL
  const toothMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.14,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: 0.22, // High-end translucency/SSS look
    thickness: 0.6, // Translucency depth
    side: THREE.DoubleSide
  });

  const toothMesh = new THREE.Mesh(toothGeometry, toothMaterial);
  toothMesh.castShadow = true;
  toothMesh.receiveShadow = true;
  scene.add(toothMesh);

  // Position tooth mesh at center, tilted slightly towards user for depth
  toothMesh.rotation.x = 0.25;
  toothMesh.rotation.z = -0.1;

  // Sync lighting to theme (Light vs Dark mode)
  function adjustLightingForTheme(theme) {
    if (theme === 'light') {
      scene.background = null;
      toothMaterial.color.setHex(0xffffff);
      toothMaterial.roughness = 0.18;
      dirLight2.color.setHex(0x3b82f6); // Soft blue light
      dirLight2.intensity = 0.7;
      pointLight.color.setHex(0x10b981);
      pointLight.intensity = 1.0;
    } else {
      scene.background = null;
      toothMaterial.color.setHex(0xffffff);
      toothMaterial.roughness = 0.14;
      dirLight2.color.setHex(0x76b896); // Mint green light
      dirLight2.intensity = 0.5;
      pointLight.color.setHex(0x10b981);
      pointLight.intensity = 1.8;
    }
  }

  // Initial adjustment based on current theme
  const initialTheme = document.documentElement.getAttribute('data-theme');
  adjustLightingForTheme(initialTheme);

  // Listen to custom theme toggle event
  window.addEventListener('themeChanged', (e) => {
    adjustLightingForTheme(e.detail.theme);
  });

  // DRAG INTERACTION (User rotation controls)
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  
  // Drag speeds
  const dragRotationSpeed = 0.007;
  
  // Friction / Inertia velocity
  let targetRotationVelocityX = 0;
  let targetRotationVelocityY = 0;

  function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = {
      x: e.clientX || e.touches[0].clientX,
      y: e.clientY || e.touches[0].clientY
    };
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const deltaX = clientX - previousMousePosition.x;
    const deltaY = clientY - previousMousePosition.y;

    // Set angular velocities based on drag distance
    targetRotationVelocityY = deltaX * dragRotationSpeed;
    targetRotationVelocityX = deltaY * dragRotationSpeed;

    previousMousePosition = {
      x: clientX,
      y: clientY
    };
  }

  function onMouseUp() {
    isDragging = false;
  }

  // Event Listeners for dragging
  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('touchstart', onMouseDown, { passive: true });
  
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onMouseMove, { passive: true });
  
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchend', onMouseUp);

  // ANIMATION LOOP (Smooth rotational inertia and idle spin)
  const clock = new THREE.Clock();
  let idleTime = 0;

  function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isDragging) {
      // Return velocity slowly to idle spin
      targetRotationVelocityX *= 0.95; // Friction
      targetRotationVelocityY *= 0.95;
      
      // Idle spin: if user hasn't dragged, rotate automatically
      idleTime += delta;
      const autoRotateSpeed = 0.4 * delta;
      
      toothMesh.rotation.y += autoRotateSpeed + targetRotationVelocityY;
      toothMesh.rotation.x += targetRotationVelocityX;
      
      // Keep X rotation within bounds so it doesn't flip completely upside down
      toothMesh.rotation.x = Math.max(-0.4, Math.min(0.6, toothMesh.rotation.x));
    } else {
      // Rotate mesh immediately using velocities
      toothMesh.rotation.y += targetRotationVelocityY;
      toothMesh.rotation.x += targetRotationVelocityX;
      toothMesh.rotation.x = Math.max(-0.4, Math.min(0.6, toothMesh.rotation.x));
      
      // Reset idle timer on user drag
      idleTime = 0;
    }

    // Add a subtle vertical floating wave effect
    toothMesh.position.y = Math.sin(Date.now() * 0.0015) * 0.12;

    renderer.render(scene, camera);
  }

  animate();

  // RESPONSIVE RESIZING
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(newWidth, newHeight);
  });
}

/* ==========================================================================
   SPECIALIZED SERVICES DASHBOARD (Glowing Panel -> Dynamic Card)
   ========================================================================== */
function initSpecializedServices() {
  const panelItems = document.querySelectorAll('.panel-item');
  const detailCard = document.getElementById('serviceDetailCard');
  
  if (!panelItems.length || !detailCard) return;

  const servicesData = {
    checkups: {
      icon: '🦷',
      title: 'Preventive Dentistry',
      desc: 'Maintain optimal oral health with routine cleanings, gentle scaling, comprehensive 3D X-rays, and customized dental health guides.'
    },
    cleaning: {
      icon: '✨',
      title: 'Cosmetic Dentistry & Cleaning',
      desc: 'Brighten your smile and eliminate stubborn stains with advanced airflow therapy, professional laser cleanings, and modern whitening guides.'
    },
    protection: {
      icon: '🛡️',
      title: 'Enamel Protection & Sealants',
      desc: 'Shield your teeth from dental caries and erosion using medical-grade fluoride varnish, durable sealants, and personalized plaque protection programs.'
    }
  };

  panelItems.forEach(item => {
    const handleSelect = () => {
      const serviceKey = item.getAttribute('data-service');
      const data = servicesData[serviceKey];
      if (!data) return;

      // Update active states
      panelItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Animate card swap (fade out, update content, fade in)
      detailCard.classList.add('changing');

      setTimeout(() => {
        detailCard.querySelector('.detail-card-icon').textContent = data.icon;
        detailCard.querySelector('.detail-card-title').textContent = data.title;
        detailCard.querySelector('.detail-card-desc').textContent = data.desc;
        
        detailCard.classList.remove('changing');
      }, 250);
    };

    item.addEventListener('click', handleSelect);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  });
}

