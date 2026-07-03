import { db } from "./firebase.js";
import {
    doc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
/* ==========================================================================
   SALUXOR INTERACTIVE ENGINE - MAIN JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // --- 1. Sticky Header & Menu Toggle ---
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking nav links on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });


    // --- 2. Interactive Hero Canvas Particle Mesh ---
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    const particles = [];
    const particleCount = 45;
    const connectionDistance = 120;

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Base Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;

            // Color palette of particles (bluish-purple accents)
            const colors = ['#2a4cd6', '#3b82f6', '#1d4ed8', '#1e3a8a'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction (Push away)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
            }

            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw central medical system orbital visual in background
        const centerX = width * 0.75;
        const centerY = height * 0.5;

        // Draw orbital rings
        ctx.strokeStyle = 'rgba(42, 76, 214, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 280, 0, Math.PI * 2);
        ctx.stroke();

        // Draw and connect particles
        particles.forEach((p, idx) => {
            p.update();
            p.draw();

            for (let j = idx + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    // Only animate canvas if user prefers motion and viewport is large
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && window.innerWidth > 768) {
        animate();
    }


    // --- 3. Scroll Trigger / Intersection Observer for Elements ---
    const scrollElements = document.querySelectorAll('.scroll-trigger-element');

    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    scrollElements.forEach(el => elementObserver.observe(el));


    // --- 4. Interactive Timeline Scroll Progress Indicator ---
    const timelineSection = document.getElementById('how-it-works');
    const progressFill = document.getElementById('timeline-progress');
    const steps = document.querySelectorAll('.timeline-step');

    window.addEventListener('scroll', () => {
        if (!timelineSection || !progressFill) return;

        const rect = timelineSection.getBoundingClientRect();
        const sectionHeight = rect.height;

        // Calculate percentage scroll inside timeline section
        const scrollInSection = -rect.top + (window.innerHeight / 2);
        let pct = (scrollInSection / sectionHeight) * 100;

        // Clamp between 0 and 100
        pct = Math.max(0, Math.min(pct, 100));
        progressFill.style.height = `${pct}%`;

        // Highlight steps based on depth scrolled
        steps.forEach((step, idx) => {
            const stepRect = step.getBoundingClientRect();
            if (stepRect.top < window.innerHeight / 2) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    });



    // --- 5. Interactive Dashboard Mockup Fluctuation (Hero) ---
    const medIntVal = document.getElementById('med-int-score');
    const fitVal = document.getElementById('fit-score');
    const stressVal = document.getElementById('stress-lvl');
    const dynamicInsight = document.getElementById('dynamic-insight');

    const insightsList = [
        "HRV optimization detected. Shift high-carb window to 1:00 PM for maximum physical absorption.",
        "Genomic profile flags mild statin sensitivity. Standard dosage adjusted by 10% under supervisor guidance.",
        "Circadian alignment: Sleep window locking in 45 mins. Dynamic blue light filters engaged on active displays.",
        "Adrenal cortisol peaks stabilized. System recommends 4-minute box breathing protocol to seal vagal recovery."
    ];

    // Simulating active telemetry updates
    setInterval(() => {
        // Fluctuate Diagnostic Accuracy
        if (medIntVal) {
            const base = 98.4;
            const variation = (Math.random() * 0.4 - 0.2).toFixed(1);
            medIntVal.textContent = `${(parseFloat(base) + parseFloat(variation)).toFixed(1)}%`;
        }

        // Fluctuate Recovery
        if (fitVal) {
            const base = 84;
            const variation = Math.floor(Math.random() * 5 - 2);
            fitVal.textContent = `${base + variation}%`;
            const indicatorBar = document.querySelector('.indicator-bar');
            if (indicatorBar) indicatorBar.style.width = `${base + variation}%`;
        }
    }, 4000);

    // Allow clicking pods to update the dynamic advice insights
    const pods = document.querySelectorAll('.dashboard-pod');
    pods.forEach((pod, index) => {
        pod.addEventListener('click', () => {
            if (dynamicInsight) {
                dynamicInsight.style.opacity = 0;
                setTimeout(() => {
                    dynamicInsight.textContent = insightsList[index % insightsList.length];
                    dynamicInsight.style.opacity = 1;
                }, 200);
            }

            // Visual feedback pulse
            pod.style.transform = 'scale(0.97)';
            setTimeout(() => pod.style.transform = 'none', 100);
        });
    });


    // --- 6. Competitor Strategic Verdict Toggle ---
    const compButtons = document.querySelectorAll('.comp-btn');
    const verdictDisplay = document.getElementById('verdict-display');

    const competitorData = {
        apple: {
            name: "Apple Health Analysis",
            verdict: "Apple Health functions as a passive repository of sensor data. It collects raw numbers but provides zero clinical directives, cannot facilitate therapeutic actions, ignores genetic variations, and has no cross-pillar correlation. It answer 'what happened?' but never 'what should I do now?'.",
            advantage: "9.8x Actionability",
            percent: 90,
            metrics: [
                { name: "Genomic Integration", status: "No", class: "no" },
                { name: "Physician Copilot Reports", status: "No", class: "no" },
                { name: "Metabolic Tracking", status: "Basic Sync", class: "yes" },
                { name: "AI-Driven Prescription Logic", status: "No", class: "no" }
            ]
        },
        noom: {
            name: "Noom / Diet Apps Analysis",
            verdict: "Noom relies heavily on user-reported calorie inputs and basic behavioral coaching. It ignores dynamic metabolic telemetry (like real-time CGM glucose response) and lacks the biometric background to check how caloric restriction alters endocrine health, cortisol levels, or autonomic heart stats.",
            advantage: "8.2x Biomarker Precision",
            percent: 88,
            metrics: [
                { name: "CGM Integration", status: "No", class: "no" },
                { name: "Genetic Nutrition Plan", status: "No", class: "no" },
                { name: "Manual Logging Required", status: "Yes (High Friction)", class: "no" },
                { name: "Physician Review Support", status: "No", class: "no" }
            ]
        },
        onemedical: {
            name: "One Medical / Primary Care Analysis",
            verdict: "Primary care clinics offer diagnostic labs but their data ingestion is episodic (once a year). They do not track your daily recovery, metabolic spikes, or stress curves, leading to reactive symptom treatment instead of proactive preventative optimization. The loops are simply too slow.",
            advantage: "365x Continual Optimization Frequency",
            percent: 95,
            metrics: [
                { name: "Epigenetic Tracking", status: "No", class: "no" },
                { name: "Daily Biometric Synthesizer", status: "No", class: "no" },
                { name: "Continuous Monitoring", status: "No", class: "no" },
                { name: "Prescribing Physician", status: "Yes", class: "yes" }
            ]
        }
    };

    compButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle button active state
            compButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const compKey = btn.getAttribute('data-competitor');
            const data = competitorData[compKey];

            if (!data || !verdictDisplay) return;

            // Transition animation
            verdictDisplay.style.opacity = 0;
            verdictDisplay.style.transform = 'translateY(5px)';

            setTimeout(() => {
                // Build Metric Comparison list
                let metricsHtml = '';
                data.metrics.forEach(m => {
                    metricsHtml += `
            <div class="comp-row">
              <span>${m.name}</span>
              <span class="val ${m.class}">${m.status}</span>
            </div>
          `;
                });

                // Inject new content
                verdictDisplay.innerHTML = `
          <div class="verdict-grid">
            <div class="verdict-analysis">
              <h4>${data.name}</h4>
              <p class="verdict-text">${data.verdict}</p>
              <div class="verdict-strength-bar">
                <span>Saluxor Advantage:</span>
                <div class="advantage-bar">
                  <div class="advantage-fill" style="width: ${data.percent}%;"></div>
                </div>
                <span class="percent">${data.advantage}</span>
              </div>
            </div>
            <div class="verdict-metric-comparison">
              ${metricsHtml}
            </div>
          </div>
        `;

                // Reset fade state
                verdictDisplay.style.opacity = 1;
                verdictDisplay.style.transform = 'translateY(0)';
            }, 200);
        });
    });


    // --- 7. Interactive Feature Card Card-Glow Move Interaction ---
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });


    // --- 8. Waitlist Form Submit Handler ---
    let currentBetaEmail = "";

    const waitlistForm = document.getElementById('waitlist-form');
    const feedback = document.getElementById('waitlist-feedback');

    if (waitlistForm && feedback) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('waitlist-email');
            const email = emailInput.value.trim();

            feedback.textContent = "Saving your beta spot...";
            feedback.className = "form-feedback";

            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = "Connecting...";

            (async () => {
                try {

                    await setDoc(doc(db, "betaUsers", email.toLowerCase()), {
                        email: email.toLowerCase(),

                        interest: "",

                        role: "",

                        feedback: "",

                        joinedAt: serverTimestamp()
                    });
                    currentBetaEmail = email.toLowerCase();
                    feedback.textContent = "🎉 Welcome to the Saluxor Beta!";
                    document.getElementById("beta-modal").classList.remove("hidden");
                    feedback.className = "form-feedback success";

                    emailInput.value = "";

                } catch (error) {

                    console.error(error);

                    feedback.textContent = "Something went wrong. Please try again.";
                    feedback.className = "form-feedback error";

                }

                submitBtn.disabled = false;
                submitBtn.textContent = origText;

            })();
        });
    }

    const finishBtn = document.getElementById("finish-beta");

    if (finishBtn) {
        finishBtn.addEventListener("click", async () => {

            const interest = document.getElementById("interest").value;

            const role = document.getElementById("role").value;

            const feedbackText = document.getElementById("feedbackText").value;

            try {

                await updateDoc(
                    doc(db, "betaUsers", currentBetaEmail),
                    {
                        interest: interest,
                        role: role,
                        feedback: feedbackText
                    }
                );

                document.getElementById("beta-modal").classList.add("hidden");

                document.getElementById("success-modal").classList.remove("hidden");
                document.getElementById("countdown").textContent = "3";

                let seconds = 3;

                const countdown = document.getElementById("countdown");

                const timer = setInterval(() => {

                    seconds--;

                    countdown.textContent = seconds;

                    if (seconds <= 0) {

                        clearInterval(timer);

                        document
                            .getElementById("success-modal")
                            .classList.add("hidden");

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }

                }, 1000);

            }
            catch (error) {

                console.error("Firebase Error:", error);

                alert(error.message);

            }

        });
    }
});
