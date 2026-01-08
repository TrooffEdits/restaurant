/**
 * ==============================================
 * MAISON RESTAURANT - JAVASCRIPT
 * Fully responsive interactions and animations
 * ==============================================
 */

(function() {
    'use strict';

    /* ==============================================
       CONFIGURATION
       ============================================== */
    const CONFIG = {
        headerScrollThreshold: 50,
        backToTopThreshold: 400,
        revealThreshold: 0.1,
        revealRootMargin: '0px 0px -10% 0px',
        debounceDelay: 100,
        throttleDelay: 16
    };


    /* ==============================================
       DOM ELEMENTS
       ============================================== */
    const elements = {
        body: document.body,
        header: document.getElementById('header'),
        menuToggle: document.getElementById('menuToggle'),
        nav: document.getElementById('nav'),
        mobileNav: document.getElementById('mobileNav'),
        revealElements: document.querySelectorAll('.reveal'),
        currentYearSpan: document.getElementById('currentYear'),
        backToTop: document.getElementById('backToTop'),
        allNavLinks: null, // Will be set after DOM is ready
        galleryItems: null // Will be set after DOM is ready
    };


    /* ==============================================
       UTILITY FUNCTIONS
       ============================================== */
    
    /**
     * Debounce function - delays execution until after wait time
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function - limits execution rate
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if device supports touch
     */
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Get current viewport width
     */
    function getViewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight * (1 - threshold);
    }


    /* ==============================================
       INITIALIZATION
       ============================================== */
    function init() {
        // Cache additional DOM elements
        elements.allNavLinks = document.querySelectorAll('a[href^="#"]');
        elements.galleryItems = document.querySelectorAll('.gallery__item');
        
        // Set reveal index for staggered animations
        setRevealIndices();
        
        // Set current year in footer
        setCurrentYear();
        
        // Initialize all features
        initScrollHandler();
        initMobileMenu();
        initSmoothScroll();
        initRevealAnimations();
        initBackToTop();
        initKeyboardNavigation();
        initTouchOptimizations();
        
        // Check for elements already in view
        checkInitialRevealElements();
        
        // Handle resize events
        initResizeHandler();
        
        console.log('Maison Restaurant - Website initialized');
    }


    /* ==============================================
       SET REVEAL INDICES
       For staggered gallery animations
       ============================================== */
    function setRevealIndices() {
        elements.galleryItems.forEach((item, index) => {
            item.style.setProperty('--reveal-index', index);
        });
    }


    /* ==============================================
       SET CURRENT YEAR
       ============================================== */
    function setCurrentYear() {
        if (elements.currentYearSpan) {
            elements.currentYearSpan.textContent = new Date().getFullYear();
        }
    }


    /* ==============================================
       SCROLL HANDLER
       Header style changes and scroll tracking
       ============================================== */
    function initScrollHandler() {
        const updateHeader = throttle(() => {
            const scrollY = window.scrollY;
            
            // Toggle header shadow
            if (scrollY > CONFIG.headerScrollThreshold) {
                elements.header.classList.add('scrolled');
            } else {
                elements.header.classList.remove('scrolled');
            }
            
            // Toggle back to top button
            if (elements.backToTop) {
                if (scrollY > CONFIG.backToTopThreshold) {
                    elements.backToTop.classList.add('visible');
                } else {
                    elements.backToTop.classList.remove('visible');
                }
            }
        }, CONFIG.throttleDelay);

        window.addEventListener('scroll', updateHeader, { passive: true });
        
        // Initial check
        updateHeader();
    }


    /* ==============================================
       MOBILE MENU
       Toggle and interactions
       ============================================== */
    function initMobileMenu() {
        if (!elements.menuToggle || !elements.mobileNav) return;

        const mobileNavLinks = elements.mobileNav.querySelectorAll('.mobile-nav__link, .mobile-nav__cta');

        // Toggle menu
        elements.menuToggle.addEventListener('click', toggleMobileMenu);

        // Close menu when clicking links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.mobileNav.classList.contains('active')) {
                closeMobileMenu();
                elements.menuToggle.focus();
            }
        });

        // Close menu when clicking outside
        elements.mobileNav.addEventListener('click', (e) => {
            if (e.target === elements.mobileNav) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        const isActive = elements.menuToggle.classList.toggle('active');
        elements.mobileNav.classList.toggle('active');
        elements.mobileNav.setAttribute('aria-hidden', !isActive);
        elements.menuToggle.setAttribute('aria-expanded', isActive);
        
        // Prevent body scroll when menu is open
        if (isActive) {
            elements.body.classList.add('menu-open');
            // Focus first menu item
            const firstLink = elements.mobileNav.querySelector('.mobile-nav__link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 300);
            }
        } else {
            elements.body.classList.remove('menu-open');
        }
    }

    function closeMobileMenu() {
        elements.menuToggle.classList.remove('active');
        elements.mobileNav.classList.remove('active');
        elements.mobileNav.setAttribute('aria-hidden', 'true');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
        elements.body.classList.remove('menu-open');
    }


    /* ==============================================
       SMOOTH SCROLL
       Scroll to sections when clicking nav links
       ============================================== */
    function initSmoothScroll() {
        elements.allNavLinks.forEach(link => {
            link.addEventListener('click', handleSmoothScroll);
        });
    }

    function handleSmoothScroll(e) {
        const href = this.getAttribute('href');
        
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            
            const headerHeight = elements.header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = targetPosition - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without triggering scroll
            history.pushState(null, null, href);
        }
    }


    /* ==============================================
       REVEAL ANIMATIONS
       Intersection Observer for scroll animations
       ============================================== */
    function initRevealAnimations() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements immediately
            elements.revealElements.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: CONFIG.revealRootMargin,
            threshold: CONFIG.revealThreshold
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.revealElements.forEach(el => observer.observe(el));
    }

    function checkInitialRevealElements() {
        // Check elements already in view on page load
        elements.revealElements.forEach(el => {
            if (isInViewport(el, 0.1)) {
                setTimeout(() => el.classList.add('revealed'), 100);
            }
        });
    }


    /* ==============================================
       BACK TO TOP BUTTON
       ============================================== */
    function initBackToTop() {
        if (!elements.backToTop) return;

        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* ==============================================
       KEYBOARD NAVIGATION
       Accessibility improvements
       ============================================== */
    function initKeyboardNavigation() {
        // Trap focus in mobile menu when open
        elements.mobileNav?.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            const focusableElements = elements.mobileNav.querySelectorAll(
                'a[href], button, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });

        // Skip to main content (if skip link exists)
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main') || document.querySelector('#hero');
                main?.focus();
            });
        }
    }


    /* ==============================================
       TOUCH OPTIMIZATIONS
       Better experience on touch devices
       ============================================== */
    function initTouchOptimizations() {
        if (!isTouchDevice()) return;

        // Add touch class to body
        elements.body.classList.add('touch-device');

        // Prevent 300ms tap delay on older browsers
        document.addEventListener('touchstart', () => {}, { passive: true });
    }


    /* ==============================================
       RESIZE HANDLER
       Handle viewport changes
       ============================================== */
    function initResizeHandler() {
        const handleResize = debounce(() => {
            const viewportWidth = getViewportWidth();
            
            // Close mobile menu if viewport is desktop size
            if (viewportWidth >= 768 && elements.mobileNav?.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Update any dynamic calculations here
        }, CONFIG.debounceDelay);

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', handleResize, { passive: true });
    }


    /* ==============================================
       PERFORMANCE OPTIMIZATIONS
       ============================================== */
    
    // Lazy load images fallback for older browsers
    function initLazyLoadFallback() {
        if ('loading' in HTMLImageElement.prototype) return;

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if (!('IntersectionObserver' in window)) {
            // Load all images immediately
            lazyImages.forEach(img => {
                if (img.dataset.src) img.src = img.dataset.src;
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }


    /* ==============================================
       ERROR HANDLING
       ============================================== */
    window.addEventListener('error', (e) => {
        console.error('Runtime error:', e.message);
    });


    /* ==============================================
       RUN ON DOM READY
       ============================================== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    /* ==============================================
       PAGE VISIBILITY API
       Pause animations when tab is not visible
       ============================================== */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden - can pause any running animations
            elements.body.classList.add('page-hidden');
        } else {
            // Page is visible again
            elements.body.classList.remove('page-hidden');
        }
    });

})();