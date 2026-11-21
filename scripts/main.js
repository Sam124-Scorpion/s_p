(function () {
      'use strict';

      let lenisInstance = null;

      // ---------------------------------------------------------
      // 1. TOAST HELPER & SAFE CLIPBOARD COPY
      // ---------------------------------------------------------
      const toastEl = document.getElementById('toast-banner');
      let toastTimer = null;

      function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.remove('translate-y-20', 'opacity-0');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toastEl.classList.add('translate-y-20', 'opacity-0');
        }, 2400);
      }

      function copyTextSafely(text) {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand('copy');
          showToast('COPIED: ' + text);
        } catch (err) {
          showToast('PRESS CTRL+C TO COPY');
        }
        document.body.removeChild(temp);
      }

      document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-copy');
          if (val) copyTextSafely(val);
        });
      });

      // ---------------------------------------------------------
      // 2. CUSTOM CURSOR & MAGNETIC MICRO-INTERACTIONS
      // ---------------------------------------------------------
      function initCursorAndMagnets() {
        const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!isFinePointer) return;

        const dot = document.getElementById('custom-cursor-dot');
        const ring = document.getElementById('custom-cursor-ring');
        if (!dot || !ring) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          dot.style.left = mouseX + 'px';
          dot.style.top = mouseY + 'px';
        });

        function renderCursor() {
          ringX += (mouseX - ringX) * 0.16;
          ringY += (mouseY - ringY) * 0.16;
          ring.style.left = ringX + 'px';
          ring.style.top = ringY + 'px';
          requestAnimationFrame(renderCursor);
        }
        renderCursor();

        document.querySelectorAll('[data-cursor-label]').forEach((el) => {
          el.addEventListener('mouseenter', () => {
            ring.textContent = el.getAttribute('data-cursor-label') || '';
            ring.classList.add('cursor-expanded');
          });
          el.addEventListener('mouseleave', () => {
            ring.textContent = '';
            ring.classList.remove('cursor-expanded');
          });
        });

        document.querySelectorAll('.magnet-target').forEach((btn) => {
          btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
            const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
            btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
          });
        });
      }

      // ---------------------------------------------------------
      // 3. CHAPTERS SLIDE-OVER DRAWER & SMOOTH SCROLL NAVIGATION
      // ---------------------------------------------------------
      const drawer = document.getElementById('chapters-drawer');
      const drawerBackdrop = document.getElementById('chapters-backdrop');
      const openDrawerBtn = document.getElementById('open-chapters-btn');
      const closeDrawerBtn = document.getElementById('close-chapters-btn');
      let isDrawerOpen = false;

      function setDrawerState(open) {
        isDrawerOpen = open;
        if (!drawer || !drawerBackdrop) return;
        if (open) {
          drawer.classList.remove('translate-x-full');
          drawerBackdrop.classList.remove('opacity-0', 'pointer-events-none');
          if (openDrawerBtn) openDrawerBtn.setAttribute('aria-expanded', 'true');
          if (lenisInstance) lenisInstance.stop();
        } else {
          drawer.classList.add('translate-x-full');
          drawerBackdrop.classList.add('opacity-0', 'pointer-events-none');
          if (openDrawerBtn) openDrawerBtn.setAttribute('aria-expanded', 'false');
          if (lenisInstance) lenisInstance.start();
        }
      }

      if (openDrawerBtn) openDrawerBtn.addEventListener('click', () => setDrawerState(true));
      if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => setDrawerState(false));
      if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => setDrawerState(false));

      function smoothScrollToTarget(selector) {
        const target = document.querySelector(selector);
        if (!target) return;
        if (lenisInstance) {
          lenisInstance.scrollTo(target, { offset: 0, duration: 1.15 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }

      document.querySelectorAll('[data-scroll-to]').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const sel = trigger.getAttribute('data-scroll-to');
          if (sel) smoothScrollToTarget(sel);
        });
      });

      document.querySelectorAll('[data-drawer-link]').forEach((link) => {
        link.addEventListener('click', () => {
          const sel = link.getAttribute('data-drawer-link');
          setDrawerState(false);
          setTimeout(() => {
            if (sel) smoothScrollToTarget(sel);
          }, 220);
        });
      });

      // ---------------------------------------------------------
      // 4. CASE STUDY ARCHITECTURE MODAL & CV MODAL
      // ---------------------------------------------------------
      const CASE_DATA = {
        'rag-parser': {
          tag: '01 // AI · NLP · RETRIEVAL-AUGMENTED GENERATION',
          title: 'Resume Parser with RAG',
          problem:
            'Recruiters and technical evaluators spend hours manually reading multi-page PDF/DOCX resumes, frequently missing nuanced project experience when relying solely on rigid keyword filters.',
          architecture:
            'Engineered a document ingestion and recursive chunking pipeline in Python, indexing dense semantic embeddings inside a FAISS vector store. Connected LangChain retrieval chains to an LLM conversational interface wrapped in an interactive Streamlit UI.',
          outcome:
            'Reduced manual candidate screening time by up to 85% while providing grounded, citation-backed responses to natural-language recruiter queries.',
          stack: ['Python', 'Streamlit', 'LangChain', 'FAISS'],
        },
        'housing-api': {
          tag: '02 // MACHINE LEARNING · PRODUCTION INFERENCE API',
          title: 'Housing Price Prediction',
          problem:
            'Raw real-estate tabular datasets contain skewed distributions, missing attributes, and non-linear feature interactions that degrade baseline regression accuracy.',
          architecture:
            'Performed systematic exploratory data analysis, outlier handling, feature engineering, and cross-validated hyperparameter tuning in Scikit-Learn. Packaged the trained model behind a FastAPI REST microservice with strict Pydantic schema validation.',
          outcome:
            'Achieved 89% prediction accuracy on held-out validation splits and exposed sub-50ms JSON inference endpoints ready for client integration.',
          stack: ['FastAPI', 'Python', 'Scikit-learn'],
        },
        'expense-manager': {
          tag: '03 // FULL-STACK WEB · AI FINANCIAL INSIGHTS',
          title: 'Daily Expense Manager',
          problem:
            'Manual expense spreadsheets fail to surface recurring spending leaks or offer actionable monthly budgeting adjustments.',
          architecture:
            'Architected a decoupled full-stack application with a Python/Django backend, SQLite3 relational ledger, and a reactive React.js frontend supporting automated classification across 10+ spending categories and AI-generated budget recommendations.',
          outcome:
            'Enabled instant expense categorization across 10+ categories and personalized AI budget advice grounded in historical spending velocity.',
          stack: ['Python', 'Django', 'React.js', 'SQLite3'],
        },
        'predo-app': {
          tag: '04 // STATISTICAL MODELING · VISUAL ANALYTICS',
          title: 'Predo — Attendance Predictor',
          problem:
            'Students struggle to calculate safe leave margins across multiple subjects without clear statistical projections of semester attendance thresholds.',
          architecture:
            'Built a Pandas statistical modeling engine analyzing attendance logs across 10+ records and rendering 5+ diagnostic Matplotlib charts inside an interactive Streamlit planning dashboard.',
          outcome:
            'Empowered proactive semester attendance planning with clear visual threshold alerts and scenario simulation.',
          stack: ['Python', 'Streamlit', 'Pandas', 'Matplotlib'],
        },
      };

      const caseModal = document.getElementById('case-modal');
      const closeCaseModalBtn = document.getElementById('close-case-modal');

      function openCaseModal(caseKey) {
        const item = CASE_DATA[caseKey];
        if (!item || !caseModal) return;
        document.getElementById('case-modal-tag').textContent = item.tag;
        document.getElementById('case-modal-title').textContent = item.title;
        document.getElementById('case-modal-problem').textContent = item.problem;
        document.getElementById('case-modal-architecture').textContent = item.architecture;
        document.getElementById('case-modal-outcome').textContent = item.outcome;

        const stackWrap = document.getElementById('case-modal-stack');
        stackWrap.innerHTML = item.stack
          .map((tech) => `<span class="px-2.5 py-1 bg-surface hairline-all text-bone">${tech}</span>`)
          .join('');

        caseModal.classList.remove('hidden');
        caseModal.classList.add('flex');
        if (lenisInstance) lenisInstance.stop();
      }

      function closeCaseModal() {
        if (!caseModal) return;
        caseModal.classList.add('hidden');
        caseModal.classList.remove('flex');
        if (lenisInstance) lenisInstance.start();
      }

      document.querySelectorAll('[data-case-id]').forEach((el) => {
        el.addEventListener('click', () => openCaseModal(el.getAttribute('data-case-id')));
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCaseModal(el.getAttribute('data-case-id'));
          }
        });
      });

      if (closeCaseModalBtn) closeCaseModalBtn.addEventListener('click', closeCaseModal);
      if (caseModal) {
        caseModal.addEventListener('click', (e) => {
          if (e.target === caseModal) closeCaseModal();
        });
      }

      // CV Modal & Direct Text/Markdown Download
      const cvModal = document.getElementById('cv-modal');
      const closeCvModalBtn = document.getElementById('close-cv-modal');
      const downloadCvTxtBtn = document.getElementById('download-cv-txt-btn');

      function openCvModal() {
        if (!cvModal) return;
        cvModal.classList.remove('hidden');
        cvModal.classList.add('flex');
        if (lenisInstance) lenisInstance.stop();
      }

      function closeCvModal() {
        if (!cvModal) return;
        cvModal.classList.add('hidden');
        cvModal.classList.remove('flex');
        if (lenisInstance) lenisInstance.start();
      }

      document.querySelectorAll('[data-open-cv]').forEach((btn) => {
        btn.addEventListener('click', openCvModal);
      });
      if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCvModal);
      if (cvModal) {
        cvModal.addEventListener('click', (e) => {
          if (e.target === cvModal) closeCvModal();
        });
      }

      if (downloadCvTxtBtn) {
        downloadCvTxtBtn.addEventListener('click', () => {
          const cvContent = [
            'SOUMIK DAS (SAM)',
            'Full-Stack Web & Data Science / AI Engineer',
            'Location: Cooch Behar, West Bengal, India',
            'Email: soumikdas261@gmail.com | Phone: +918942862272',
            'LinkedIn: https://www.linkedin.com/in/sam124/ | GitHub: https://github.com/Sam124-Scorpion',
            '',
            'EDUCATION',
            '- B.Tech CSE (Data Science), Brainware University (2022–2026) — 9.02/10 CGPA',
            '- Higher Secondary (12th), Cooch Behar Rambhola High School, WBCHSE (2020–2022) — 82%',
            '- Secondary (10th), Maharaja Nripendra Narayan High School, WBBSE (2018–2020) — 84%',
            '',
            'EXPERIENCE',
            '- Industry Intern - Web Dev (Django + AI) | Euphoria GenX Pvt. Ltd. (Brainware University) | Aug 2025 – Nov 2025',
            '  Built an AI-integrated expense management system using Python/Django (MVT) and 8+ REST APIs, cutting manual data entry by 85%; earned dual certifications.',
            '- Machine Learning Intern | Indus Net Technologies | Feb 2025 – Mar 2025',
            '  Built an end-to-end sentiment analysis pipeline using Python, Pandas, and Scikit-Learn achieving 87%+ accuracy.',
            '',
            'SELECTED PROJECTS',
            '- Resume Parser with RAG (Architect): Python, Streamlit, LangChain, FAISS — up to 85% screening time reduction.',
            '- Housing Price Prediction (Developer): FastAPI, Python, Scikit-learn — 89% prediction accuracy REST API.',
            '- Daily Expense Manager (Developer): Python, Django, React.js, SQLite3 — 10+ spending categories & AI budget advice.',
            '- Predo — Attendance Predictor (Developer): Python, Streamlit, Pandas, Matplotlib — 10+ records & 5+ visualizations.',
            '',
            'TECHNICAL TOOLKIT',
            '- Languages & Scripting: Python, SQL, C++',
            '- Frameworks, Libraries & AI/Data: Django, FastAPI, React, Streamlit, LangChain, FAISS, Pandas, Scikit-Learn, Matplotlib, EDA, RAG',
            '- Databases & Tools: PostgreSQL, MySQL, SQLite, MongoDB, Git, GitHub, Postman',
            '- Languages Spoken: Bengali, English, Hindi',
          ].join('\n');

          const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Soumik_Das_SAM_CV.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('CV DOWNLOADED');
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (isDrawerOpen) setDrawerState(false);
          closeCaseModal();
          closeCvModal();
        }
      });

      // ---------------------------------------------------------
      // 5. STAGE 2 THREE.JS: S-CURVE STARDUST RIBBON & 3D HUMANOID
      // ---------------------------------------------------------
      function initStage2IntroScene() {
        const stage = document.getElementById('intro-three-stage');
        const canvas = document.getElementById('intro-three-canvas');
        if (!stage || !canvas || typeof THREE === 'undefined') return;

        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          });
        } catch (err) {
          return; // Graceful fallback if WebGL is unavailable
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, Math.max(stage.clientWidth, 1) / Math.max(stage.clientHeight, 1), 0.1, 1000);
        camera.position.set(0, 0.05, 8.6);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(stage.clientWidth, stage.clientHeight);

        // Studio Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const keyLight = new THREE.DirectionalLight(0xfff5ee, 1.35);
        keyLight.position.set(-3.5, 4.5, 5.0);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xff4d1c, 0.9);
        rimLight.position.set(4.0, -1.5, -3.0);
        scene.add(rimLight);

        const rootGroup = new THREE.Group();
        scene.add(rootGroup);

        // Soft Coral-Rose Sphere Backdrop
        const backdropDisc = new THREE.Mesh(
          new THREE.CircleGeometry(1.62, 64),
          new THREE.MeshBasicMaterial({ color: 0xd96b6b, transparent: true, opacity: 0.92 })
        );
        backdropDisc.position.set(0.55, -0.1, -0.85);
        rootGroup.add(backdropDisc);

        const sphereWire = new THREE.Mesh(
          new THREE.SphereGeometry(1.64, 18, 12),
          new THREE.MeshBasicMaterial({ color: 0x070707, wireframe: true, transparent: true, opacity: 0.14 })
        );
        sphereWire.position.copy(backdropDisc.position);
        rootGroup.add(sphereWire);

        // Stylized Matte-Metallic 3D Humanoid Figure
        const figureGroup = new THREE.Group();
        figureGroup.position.set(0.68, -0.12, 0.25);
        rootGroup.add(figureGroup);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xa4a4a4, metalness: 0.56, roughness: 0.34 });
        const limbMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, metalness: 0.5, roughness: 0.38 });

        function createCapsule(radius, length, mat) {
          const g = new THREE.Group();
          const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 24), mat);
          const top = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), mat);
          top.position.y = length / 2;
          const bot = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), mat);
          bot.position.y = -length / 2;
          g.add(cyl, top, bot);
          return g;
        }

        const head = createCapsule(0.32, 0.28, bodyMat);
        head.position.set(0, 1.52, 0.04);
        figureGroup.add(head);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.22, 16), limbMat);
        neck.position.set(0, 1.15, 0);
        figureGroup.add(neck);

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 1.28, 28), bodyMat);
        torso.scale.set(1.0, 1.0, 0.62);
        torso.position.set(0, 0.42, 0);
        figureGroup.add(torso);

        const leftArm = createCapsule(0.145, 1.05, limbMat);
        leftArm.position.set(-0.56, 0.42, 0.04);
        leftArm.rotation.z = -0.14;
        figureGroup.add(leftArm);

        const rightArm = createCapsule(0.145, 1.05, limbMat);
        rightArm.position.set(0.56, 0.42, 0.04);
        rightArm.rotation.z = 0.14;
        figureGroup.add(rightArm);

        const leftLeg = createCapsule(0.175, 1.32, limbMat);
        leftLeg.position.set(-0.22, -0.88, 0);
        figureGroup.add(leftLeg);

        const rightLeg = createCapsule(0.175, 1.32, limbMat);
        rightLeg.position.set(0.22, -0.88, 0);
        figureGroup.add(rightLeg);

        // Sweeping S-Curve Stardust Particle Galaxy Ribbon
        const count = 4200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const cIvory = new THREE.Color('#F4F1EA');
        const cCoral = new THREE.Color('#FF4D1C');
        const cAmber = new THREE.Color('#E8B48A');

        for (let i = 0; i < count; i++) {
          const t = (Math.random() - 0.5) * 2.0;
          const widthSpread = (Math.random() - 0.5) * (0.44 + Math.abs(t) * 0.24);
          const depthSpread = (Math.random() - 0.5) * 0.9;

          const spineX = t * 2.55 + Math.sin(t * Math.PI * 1.15) * 1.15;
          const spineY = -t * 2.85 + Math.cos(t * Math.PI * 0.85) * 0.55;
          const spineZ = Math.sin(t * Math.PI) * 0.85;

          const scatter = Math.random() < 0.14 ? 2.4 : 1.0;
          positions[i * 3] = spineX + widthSpread * scatter;
          positions[i * 3 + 1] = spineY + widthSpread * 0.65 * scatter;
          positions[i * 3 + 2] = spineZ + depthSpread * scatter;

          const r = Math.random();
          const chosen = r < 0.56 ? cIvory : r < 0.86 ? cCoral : cAmber;
          colors[i * 3] = chosen.r;
          colors[i * 3 + 1] = chosen.g;
          colors[i * 3 + 2] = chosen.b;
        }

        const ribbonGeo = new THREE.BufferGeometry();
        ribbonGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        ribbonGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const galaxyRibbon = new THREE.Points(
          ribbonGeo,
          new THREE.PointsMaterial({ size: 0.044, vertexColors: true, transparent: true, opacity: 0.94, depthWrite: false })
        );
        rootGroup.add(galaxyRibbon);

        // 360° Drag & Pointer Parallax
        let isDragging = false;
        let prevX = 0;
        let prevY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let parallaxX = 0;
        let parallaxY = 0;

        stage.addEventListener('mousedown', (e) => {
          if (e.target.closest('button')) return;
          isDragging = true;
          prevX = e.clientX;
          prevY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
          const rect = stage.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            parallaxY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.36;
            parallaxX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.24;
          }
          if (!isDragging) return;
          targetRotY += (e.clientX - prevX) * 0.007;
          targetRotX += (e.clientY - prevY) * 0.007;
          prevX = e.clientX;
          prevY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
          isDragging = false;
        });

        stage.addEventListener('touchstart', (e) => {
          if (e.target.closest('button') || e.touches.length !== 1) return;
          isDragging = true;
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
        }, { passive: true });

        stage.addEventListener('touchmove', (e) => {
          if (!isDragging || e.touches.length !== 1) return;
          targetRotY += (e.touches[0].clientX - prevX) * 0.007;
          targetRotX += (e.touches[0].clientY - prevY) * 0.007;
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
        }, { passive: true });

        stage.addEventListener('touchend', () => {
          isDragging = false;
        });

        // Clean ResizeObserver
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height);
            }
          }
        });
        ro.observe(stage);

        const clock = new THREE.Clock();
        function animateStage2() {
          requestAnimationFrame(animateStage2);
          const t = clock.getElapsedTime();
          figureGroup.position.y = -0.12 + Math.sin(t * 1.6) * 0.08;
          figureGroup.rotation.y = Math.sin(t * 0.7) * 0.14;
          sphereWire.rotation.y += 0.0025;
          galaxyRibbon.rotation.z = Math.sin(t * 0.4) * 0.04;

          rootGroup.rotation.x += (targetRotX + parallaxX - rootGroup.rotation.x) * 0.08;
          rootGroup.rotation.y += (targetRotY + parallaxY - rootGroup.rotation.y) * 0.08;
          renderer.render(scene, camera);
        }
        animateStage2();
      }

      // ---------------------------------------------------------
      // 6. STAGE 3 THREE.JS: 3D DIMENSIONAL ORBITAL PARTICLE CORE
      // ---------------------------------------------------------
      const DOMAIN_NODES = {
        analytics: {
          title: '01 // ANALYTICS & EDA',
          desc: 'Exploratory data analysis, statistical hypothesis testing, and Matplotlib visual storytelling to uncover actionable signal before modeling.',
          stack: 'PYTHON · PANDAS · SQL · MATPLOTLIB',
          rotX: 0.25,
          rotY: -0.55,
        },
        aiml: {
          title: '02 // AI, ML & RAG PIPELINES',
          desc: 'Retrieval-Augmented Generation with LangChain & FAISS vector search alongside supervised Scikit-Learn models tuned for high accuracy.',
          stack: 'LANGCHAIN · FAISS · SCIKIT-LEARN · STREAMLIT',
          rotX: -0.35,
          rotY: 0.75,
        },
        data: {
          title: '03 // DATA ENGINEERING & STORAGE',
          desc: 'Relational and document schema design, query optimization, and clean ETL preprocessing across PostgreSQL, MySQL, SQLite, and MongoDB.',
          stack: 'POSTGRESQL · MYSQL · SQLITE · MONGODB · SQL',
          rotX: 0.55,
          rotY: -0.95,
        },
        systems: {
          title: '04 // BACKEND API SYSTEMS',
          desc: 'High-throughput REST microservices with FastAPI and Python/Django MVT architectures engineered for reliability and clean contracts.',
          stack: 'FASTAPI · DJANGO · PYTHON · C++ · POSTMAN',
          rotX: -0.45,
          rotY: 1.25,
        },
        fullstack: {
          title: '05 // FULL-STACK PRODUCT DELIVERY',
          desc: 'End-to-end interactive web applications pairing React interfaces with intelligent Python backends and clean Git/GitHub workflows.',
          stack: 'REACT · DJANGO · FASTAPI · GIT · GITHUB',
          rotX: 0.15,
          rotY: 1.85,
        },
      };

      function initDimensionalOrbitalCore() {
        const stage = document.getElementById('orbital-three-stage');
        const canvas = document.getElementById('orbital-three-canvas');
        if (!stage || !canvas || typeof THREE === 'undefined') return;

        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          });
        } catch (err) {
          return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, Math.max(stage.clientWidth, 1) / Math.max(stage.clientHeight, 1), 0.1, 1000);
        camera.position.set(0, 0, 7.6);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(stage.clientWidth, stage.clientHeight);

        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // Central Particle Sphere Shell
        const sphereCount = 2400;
        const spherePos = new Float32Array(sphereCount * 3);
        const sphereCol = new Float32Array(sphereCount * 3);
        const cBone = new THREE.Color('#F4F1EA');
        const cSignal = new THREE.Color('#FF4D1C');
        const cSage = new THREE.Color('#D1E0A3');

        for (let i = 0; i < sphereCount; i++) {
          const phi = Math.acos(2 * Math.random() - 1);
          const theta = Math.random() * Math.PI * 2;
          const r = 1.65 + (Math.random() - 0.5) * 0.24;

          spherePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          spherePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          spherePos[i * 3 + 2] = r * Math.cos(phi);

          const pick = Math.random();
          const c = pick < 0.62 ? cBone : pick < 0.88 ? cSignal : cSage;
          sphereCol[i * 3] = c.r;
          sphereCol[i * 3 + 1] = c.g;
          sphereCol[i * 3 + 2] = c.b;
        }

        const sphereGeo = new THREE.BufferGeometry();
        sphereGeo.setAttribute('position', new THREE.BufferAttribute(spherePos, 3));
        sphereGeo.setAttribute('color', new THREE.BufferAttribute(sphereCol, 3));
        coreGroup.add(
          new THREE.Points(
            sphereGeo,
            new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.92 })
          )
        );

        // Helper to Create Inclined Particle Orbital Rings
        function buildOrbitalRing(radius, tubeSpread, tiltX, tiltZ, count) {
          const pos = new Float32Array(count * 3);
          const col = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
            const radialOffset = radius + (Math.random() - 0.5) * tubeSpread;
            const yOffset = (Math.random() - 0.5) * (tubeSpread * 0.7);
            pos[i * 3] = Math.cos(angle) * radialOffset;
            pos[i * 3 + 1] = yOffset;
            pos[i * 3 + 2] = Math.sin(angle) * radialOffset;

            const c = Math.random() < 0.65 ? cBone : cSignal;
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          g.setAttribute('color', new THREE.BufferAttribute(col, 3));
          const pts = new THREE.Points(
            g,
            new THREE.PointsMaterial({ size: 0.042, vertexColors: true, transparent: true, opacity: 0.9 })
          );
          pts.rotation.x = tiltX;
          pts.rotation.z = tiltZ;
          return pts;
        }

        const ringOne = buildOrbitalRing(2.85, 0.34, 0.58, 0.42, 1600);
        const ringTwo = buildOrbitalRing(3.15, 0.28, -0.52, -0.38, 1400);
        coreGroup.add(ringOne, ringTwo);

        // Subtle Hairline Wireframe Guide Rings
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xf4f1ea, wireframe: true, transparent: true, opacity: 0.06 });
        const guideTorus = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.008, 8, 96), wireMat);
        guideTorus.rotation.x = Math.PI / 2.4;
        coreGroup.add(guideTorus);

        let isDragging = false;
        let prevX = 0;
        let prevY = 0;
        let targetRotX = 0.25;
        let targetRotY = -0.55;
        let autoSpinSpeed = 0.0022;

        stage.addEventListener('mousedown', (e) => {
          if (e.target.closest('button')) return;
          isDragging = true;
          prevX = e.clientX;
          prevY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          targetRotY += (e.clientX - prevX) * 0.008;
          targetRotX += (e.clientY - prevY) * 0.008;
          prevX = e.clientX;
          prevY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
          isDragging = false;
        });

        stage.addEventListener('touchstart', (e) => {
          if (e.target.closest('button') || e.touches.length !== 1) return;
          isDragging = true;
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
        }, { passive: true });

        stage.addEventListener('touchmove', (e) => {
          if (!isDragging || e.touches.length !== 1) return;
          targetRotY += (e.touches[0].clientX - prevX) * 0.008;
          targetRotX += (e.touches[0].clientY - prevY) * 0.008;
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
        }, { passive: true });

        stage.addEventListener('touchend', () => {
          isDragging = false;
        });

        // Domain Node Buttons -> Rotate Core & Update Telemetry
        const nodeBtns = document.querySelectorAll('.domain-node-btn');
        nodeBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-node-key');
            const cfg = DOMAIN_NODES[key];
            if (!cfg) return;

            nodeBtns.forEach((b) => {
              b.classList.remove('border-signal', 'text-signal');
              b.classList.add('border-bone/25');
            });
            btn.classList.remove('border-bone/25');
            btn.classList.add('border-signal', 'text-signal');

            targetRotX = cfg.rotX;
            targetRotY = cfg.rotY;
            autoSpinSpeed = 0.0008;

            document.getElementById('telemetry-title').textContent = cfg.title;
            document.getElementById('telemetry-desc').textContent = cfg.desc;
            document.getElementById('telemetry-stack').textContent = cfg.stack;
          });
        });

        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height);
            }
          }
        });
        ro.observe(stage);

        function animateOrbitalCore() {
          requestAnimationFrame(animateOrbitalCore);
          if (!isDragging) {
            targetRotY += autoSpinSpeed;
          }
          ringOne.rotation.y += 0.0035;
          ringTwo.rotation.y -= 0.0028;

          coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.07;
          coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.07;
          renderer.render(scene, camera);
        }
        animateOrbitalCore();
      }

      // ---------------------------------------------------------
      // 7. LENIS SMOOTH SCROLL + GSAP SCROLLTRIGGER ORCHESTRATION
      // ---------------------------------------------------------
      function initLenisAndScrollAnimations() {
        if (typeof Lenis !== 'undefined') {
          lenisInstance = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          });

          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenisInstance.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
              lenisInstance.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
          } else {
            function raf(time) {
              lenisInstance.raf(time);
              requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
          }
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // Reveal Sticky Top Navbar when scrolling into Stage 3 (#hero)
        const navbar = document.getElementById('main-navbar');
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top 65%',
          onEnter: () => {
            if (!navbar) return;
            navbar.classList.remove('opacity-0', '-translate-y-full', 'pointer-events-none');
            navbar.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
          },
          onLeaveBack: () => {
            if (!navbar) return;
            navbar.classList.add('opacity-0', '-translate-y-full', 'pointer-events-none');
            navbar.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
          },
        });

        // Stage 3 Hero Staggered Entrance
        gsap.from('.hero-reveal', {
          y: 28,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top 80%',
            once: true,
          },
        });

        // Editorial Section Reveals
        gsap.utils.toArray('.reveal-up').forEach((el) => {
          gsap.from(el, {
            y: 26,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          });
        });

        // Animated Metric Counters (9.02, 85%, 89%)
        document.querySelectorAll('.stat-counter').forEach((counterEl) => {
          const target = parseFloat(counterEl.getAttribute('data-target') || '0');
          const decimals = parseInt(counterEl.getAttribute('data-decimals') || '0', 10);
          const obj = { val: 0 };

          ScrollTrigger.create({
            trigger: counterEl,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => {
                  counterEl.textContent = obj.val.toFixed(decimals);
                },
              });
            },
          });
        });
      }

      // ---------------------------------------------------------
      // 8. STAGE 1 PRELOADER -> STAGE 2 ENTRANCE SEQUENCE
      // ---------------------------------------------------------
      function runStage1Preloader(onComplete) {
        const preloader = document.getElementById('universe-preloader');
        const percentEl = document.getElementById('preloader-percent');
        const barEl = document.getElementById('preloader-bar');

        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        if (!preloader || typeof gsap === 'undefined') {
          if (preloader) preloader.style.display = 'none';
          document.body.style.overflow = '';
          if (onComplete) onComplete();
          return;
        }

        const state = { pct: 0 };
        const tl = gsap.timeline({
          onComplete: () => {
            preloader.style.pointerEvents = 'none';
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            if (onComplete) onComplete();
          },
        });

        tl.to(state, {
          pct: 100,
          duration: 2.0,
          ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(state.pct);
            if (percentEl) percentEl.textContent = v + '%';
            if (barEl) barEl.style.width = v + '%';
          },
        }).to(preloader, {
          yPercent: -100,
          opacity: 0,
          duration: 0.75,
          ease: 'power4.inOut',
          delay: 0.15,
        });
      }

      function runStage2Entrance() {
        if (typeof gsap === 'undefined') return;
        gsap.from('.intro-line', {
          yPercent: 105,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power4.out',
          clearProps: 'transform',
        });
        gsap.from('.intro-reveal', {
          y: 18,
          opacity: 0,
          duration: 0.75,
          stagger: 0.12,
          delay: 0.25,
          ease: 'power3.out',
          clearProps: 'transform',
        });
        gsap.from('.intro-orbit-badge', {
          scale: 0.65,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          delay: 0.35,
          ease: 'back.out(1.6)',
          clearProps: 'transform',
        });
      }

      // Boot Application on Window Load
      window.addEventListener('load', () => {
        initCursorAndMagnets();
        initStage2IntroScene();
        initDimensionalOrbitalCore();

        runStage1Preloader(() => {
          initLenisAndScrollAnimations();
          runStage2Entrance();
        });
      });
    })();
