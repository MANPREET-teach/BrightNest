/* ============================================
   BrightNest Cleaning Co. — script.js
   Features:
   - Responsive mobile navigation
   - Navbar scroll state
   - Footer year
   - Accessible FAQ accordions (single-open behavior)
   - Form validation with inline errors
   - Demo-only form handling (no data sent)
   ============================================ */

(function() {
    "use strict";

    /* -------------------------------------------
       1. Navbar: scroll state + mobile toggle
       ------------------------------------------- */
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    // Add scrolled class after a small scroll
    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // Mobile menu toggle
    function closeMobileMenu() {
        if (!navLinks || !hamburger) return;
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
    }

    function toggleMobileMenu() {
        if (!navLinks || !hamburger) return;
        const isOpen = navLinks.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", String(isOpen));
    }

    if (hamburger) {
        hamburger.addEventListener("click", toggleMobileMenu);
    }

    // Close the mobile menu when a link is clicked
    if (navLinks) {
        navLinks.querySelectorAll("a").forEach(function(link) {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    // Close the mobile menu on Escape
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    // Close mobile menu when clicking outside of it
    document.addEventListener("click", function(event) {
        if (!navLinks || !hamburger) return;
        if (!navLinks.classList.contains("active")) return;
        const clickedInsideNav = navLinks.contains(event.target);
        const clickedHamburger = hamburger.contains(event.target);
        if (!clickedInsideNav && !clickedHamburger) {
            closeMobileMenu();
        }
    });

    /* -------------------------------------------
       2. Footer year
       ------------------------------------------- */
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    /* -------------------------------------------
       3. FAQ accordions — single open at a time
       ------------------------------------------- */
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));

    faqItems.forEach(function(item) {
        item.addEventListener("toggle", function() {
            if (!item.open) return;
            faqItems.forEach(function(other) {
                if (other !== item && other.open) {
                    other.open = false;
                }
            });
        });
    });

    /* -------------------------------------------
       4. Quote form validation (demo only)
       ------------------------------------------- */
    const form = document.getElementById("quoteForm");
    const formStatus = document.getElementById("formStatus");

    if (!form) return;

    /**
     * Show an inline error for a given field.
     * @param {HTMLElement} field
     * @param {string} message
     */
    function setFieldError(field, message) {
        const errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
        if (errorEl) {
            errorEl.textContent = message || "";
        }
        if (message) {
            field.setAttribute("aria-invalid", "true");
        } else {
            field.removeAttribute("aria-invalid");
        }
    }

    /**
     * Clear all inline errors and status.
     */
    function clearAllErrors() {
        form.querySelectorAll(".field-error").forEach(function(el) {
            el.textContent = "";
        });
        form.querySelectorAll("[aria-invalid]").forEach(function(el) {
            el.removeAttribute("aria-invalid");
        });
        if (formStatus) {
            formStatus.textContent = "";
            formStatus.classList.remove("success", "error");
        }
    }

    /**
     * Validate a single field. Returns true if valid.
     * @param {HTMLElement} field
     * @returns {boolean}
     */
    function validateField(field) {
        if (!field) return true;
        const value = (field.value || "").trim();

        // Required text/select/textarea fields
        if (field.hasAttribute("required")) {
            if (field.type === "checkbox") {
                if (!field.checked) {
                    setFieldError(field, "Please confirm you understand this is a demo form.");
                    return false;
                }
            } else if (!value) {
                setFieldError(field, "This field is required.");
                return false;
            }
        }

        // Email format
        if (field.type === "email" && value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailPattern.test(value)) {
                setFieldError(field, "Please enter a valid email address.");
                return false;
            }
        }

        // Optional phone: if provided, allow digits, spaces, parentheses, hyphens, plus
        if (field.type === "tel" && value) {
            const phonePattern = /^[+()\-\s\d]{7,20}$/;
            if (!phonePattern.test(value)) {
                setFieldError(field, "Please enter a valid phone number.");
                return false;
            }
        }

        // Minimal message length
        if (field.id === "message" && value && value.length < 10) {
            setFieldError(field, "Please add a little more detail (at least 10 characters).");
            return false;
        }

        setFieldError(field, "");
        return true;
    }

    // Attach live validation on blur
    const formFields = Array.from(
        form.querySelectorAll("input, select, textarea")
    );

    formFields.forEach(function(field) {
        field.addEventListener("blur", function() {
            validateField(field);
        });
        // Clear the error once the user starts correcting it
        field.addEventListener("input", function() {
            if (field.getAttribute("aria-invalid") === "true") {
                validateField(field);
            }
        });
    });

    // Handle submit
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        clearAllErrors();

        let isValid = true;
        let firstInvalidField = null;

        formFields.forEach(function(field) {
            const fieldValid = validateField(field);
            if (!fieldValid) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (!isValid) {
            if (formStatus) {
                formStatus.textContent = "Please fix the highlighted fields and try again.";
                formStatus.classList.add("error");
                formStatus.classList.remove("success");
            }
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // Demo-only success handling — no network request is made.
        if (formStatus) {
            formStatus.textContent =
                "Demo submission received! This form does not send data — in a live site, your quote request would be delivered here.";
            formStatus.classList.add("success");
            formStatus.classList.remove("error");
        }

        // Reset the form (keeps the demo clear and clean)
        form.reset();

        // Clear any residual aria-invalid states after reset
        formFields.forEach(function(field) {
            field.removeAttribute("aria-invalid");
        });
    });
})();