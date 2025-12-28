// Safe Google Analytics Event Tracking (no-op if gtag not available)
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag === 'function') {
        try { gtag('event', eventName, parameters); } catch (e) { /* ignore */ }
    }
}

// SPA Navigation with Smooth Scrolling and product view handling
document.addEventListener('DOMContentLoaded', function() {
    // Ensure CSS --nav-height matches the actual nav height so content never slips under it
    const navbar = document.getElementById('navbar');
    function updateNavHeight() {
        if (!navbar) return;
        const h = navbar.offsetHeight;
        document.documentElement.style.setProperty('--nav-height', h + 'px');
    }
    // Update on load and resize to handle dynamic content/fonts/images
    window.addEventListener('load', updateNavHeight);
    window.addEventListener('resize', updateNavHeight);
    // Call once now in case DOMContentLoaded occurs after layout
    updateNavHeight();
    // Mobile nav toggle
    const navToggle = document.getElementById('nav-toggle');
    const navList = document.getElementById('nav-list');
    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            const open = navList.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Close nav when a nav-link is activated (helpful on mobile)
        document.querySelectorAll('#nav-list .nav-link').forEach(a => {
            a.addEventListener('click', () => {
                navList.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Set current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    const backBtns = document.querySelectorAll('.back-btn');

    function showSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            // add active so it animates into view
            targetSection.classList.add('active');
            trackEvent('page_view', { page_title: targetId });
            targetSection.setAttribute('tabindex', '-1');
            targetSection.focus({ preventScroll: true });
            try { history.replaceState && history.replaceState(null, '', `#${targetId}`); } catch (e) { /* ignore */ }
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                showSection(targetId);
                // close nav on selection for mobile
                if (navList) { navList.classList.remove('open'); navToggle && navToggle.setAttribute('aria-expanded', 'false'); }
            }
            // Otherwise let normal navigation occur
        });
    });

    // Handle View Details buttons (product detail SPA)
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productType = this.getAttribute('data-product');
            const detailId = `${productType}-details`;
            showSection(detailId);
            trackEvent('product_view', { product: productType });
        });
    });

    // Handle Back buttons
    backBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const backTo = this.getAttribute('data-back');
            showSection(backTo);
        });
    });

    // Track phone and WhatsApp clicks
    const phoneLink = document.getElementById('phone-link');
    const whatsappLink = document.getElementById('whatsapp-link');
    if (phoneLink) phoneLink.addEventListener('click', () => trackEvent('phone_click'));
    if (whatsappLink) whatsappLink.addEventListener('click', () => trackEvent('whatsapp_click'));

    // Contact Form Submission (no backend) — show confirmation and reset
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = this;
            const data = {};
            new FormData(form).forEach((v, k) => data[k] = v);
            trackEvent('contact_submit', { name: data.name || '', email: data.email || '' });
            if (formMessage) {
                formMessage.textContent = 'Thank you — your message has been received. We will contact you soon.';
                formMessage.classList.add('success');
            }
            form.reset();
            setTimeout(() => {
                if (formMessage) { formMessage.textContent = ''; formMessage.classList.remove('success'); }
            }, 6000);
        });
    }

    // On load, respect location hash (e.g., index.html#about)
    if (location.hash) {
        const target = location.hash.substring(1);
        // small timeout to ensure sections NodeList is ready
        setTimeout(() => showSection(target), 50);
    }

    // Highlight nav links when sections enter viewport (scroll spy)
    if ('IntersectionObserver' in window) {
        // compute dynamic rootMargin using current nav height
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
        const animOffset = 0; // no extra offset needed when sections do not translate
        const rootMarginTop = -(navHeight + animOffset) + 'px';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = document.querySelector(`#nav-list a[href="#${id}"]`);
                // toggle active class on section for animation
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
                // update nav link highlights
                if (link && entry.isIntersecting) {
                    document.querySelectorAll('#nav-list a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }, { threshold: 0.45, rootMargin: `${rootMarginTop} 0px -40px 0px` });
        sections.forEach(s => observer.observe(s));
    }

    // react to manual hash changes
    window.addEventListener('hashchange', () => {
        const id = location.hash.replace('#','');
        if (id) showSection(id);
    });

    const images = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".close-btn");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentIndex = 0;

// Open Lightbox
images.forEach((img, index) => {
    img.addEventListener("click", () => {
        currentIndex = index;
        showImage();
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
});

function showImage() {
    lightboxImg.src = images[currentIndex].src;
}

// Close Lightbox
closeBtn.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
});

function closeLightbox() {
    lightbox.style.display = "none";
    document.body.style.overflow = "auto";
}

// Navigation
nextBtn.addEventListener("click", e => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
});

prevBtn.addEventListener("click", e => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
});

// Keyboard support
document.addEventListener("keydown", e => {
    if (lightbox.style.display !== "flex") return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "ArrowLeft") prevBtn.click();
});

});