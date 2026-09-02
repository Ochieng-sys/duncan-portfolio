/* =========================================
   NAVIGATION NAVIGATION TOGGLE
========================================= */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", isOpen);
    });
}

/* =========================================
   CONTACT FORM — PROFESSIONAL UX
========================================= */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    const submitButton = document.getElementById("submit-btn");
    const formStatus = document.getElementById("form-status");

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        /* =========================
           GET FORM VALUES
        ========================= */
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const service = document.getElementById("service").value.trim();
        const message = document.getElementById("message").value.trim();

        /* =========================
           CLIENT-SIDE VALIDATION
        ========================= */
        if (!name) {
            formStatus.textContent = "Please enter your name.";
            formStatus.className = "form-status error";
            return;
        }

        if (!email) {
            formStatus.textContent = "Please enter your email address.";
            formStatus.className = "form-status error";
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            formStatus.textContent = "Please enter a valid email address.";
            formStatus.className = "form-status error";
            return;
        }

        if (!message) {
            formStatus.textContent = "Please enter a message.";
            formStatus.className = "form-status error";
            return;
        }

        if (message.length < 10) {
            formStatus.textContent = "Please provide a little more detail about your project.";
            formStatus.className = "form-status error";
            return;
        }

        /* =========================
           LOADING STATE
        ========================= */
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        formStatus.textContent = "";
        formStatus.className = "form-status";

        try {
            /* =========================
               SEND TO API (Relative Path)
            ========================= */
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, service, message })
            });

            const data = await response.json();

            /* =========================
               API ERROR
            ========================= */
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to send your message.");
            }

            /* =========================
               SUCCESS
            ========================= */
            formStatus.textContent = "✓ Your message has been sent successfully. I'll get back to you soon.";
            formStatus.className = "form-status success";
            contactForm.reset();

        } catch (error) {
            console.error("Contact form error:", error);
            formStatus.textContent = error.message || "Something went wrong. Please try again.";
            formStatus.className = "form-status error";
        } finally {
            /* =========================
               RESTORE BUTTON
            ======================== */
            submitButton.disabled = false;
            submitButton.textContent = "Send Message →";
        }
    });
}
