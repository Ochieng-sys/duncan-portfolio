const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");


menuToggle.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute(
        "aria-expanded",
        isOpen
    );

});

/* =========================
   CONTACT FORM
========================= */

const contactForm =
    document.getElementById("contact-form");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                document.getElementById(
                    "submit-btn"
                );

            const formStatus =
                document.getElementById(
                    "form-status"
                );


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const service =
                document.getElementById(
                    "service"
                ).value;


            const message =
                document.getElementById(
                    "message"
                ).value.trim();


            /* =========================
               BUTTON STATE
            ========================= */

            submitButton.disabled = true;

            submitButton.textContent =
                "Sending...";


            formStatus.textContent = "";


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/contact",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                service: service,

                                message: message

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Something went wrong."
                    );

                }


                /* =========================
                   SUCCESS
                ========================= */

                formStatus.textContent =
                    data.message;


                contactForm.reset();


            } catch (error) {

                console.error(error);


                formStatus.textContent =
                    error.message ||
                    "Unable to send your message.";


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Send Message →";

            }

        }
    );

}

/* =========================================
   CONTACT FORM — PROFESSIONAL UX
========================================= */

const contactForm =
    document.getElementById("contact-form");

if (contactForm) {

    const submitButton =
        document.getElementById("submit-btn");

    const formStatus =
        document.getElementById("form-status");


    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================
               GET FORM VALUES
            ========================= */

            const name =
                document.getElementById("name")
                    .value
                    .trim();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const service =
                document.getElementById("service")
                    .value
                    .trim();

            const message =
                document.getElementById("message")
                    .value
                    .trim();


            /* =========================
               CLIENT-SIDE VALIDATION
            ========================= */

            if (!name) {

                showFormError(
                    "Please enter your name."
                );

                return;
            }


            if (!email) {

                showFormError(
                    "Please enter your email address."
                );

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showFormError(
                    "Please enter a valid email address."
                );

                return;
            }


            if (!message) {

                showFormError(
                    "Please enter a message."
                );

                return;
            }


            if (message.length < 10) {

                showFormError(
                    "Please provide a little more detail about your project."
                );

                return;
            }


            /* =========================
               LOADING STATE
            ========================= */

            submitButton.disabled = true;

            submitButton.textContent =
                "Sending...";


            formStatus.textContent = "";

            formStatus.className =
                "form-status";


            try {

                /* =========================
                   SEND TO API
                ========================= */

                const response =
                    await fetch(
                        "/api/contact",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    service,
                                    message
                                })

                        }
                    );


                const data =
                    await response.json();


                /* =========================
                   API ERROR
                ========================= */

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to send your message."
                    );

                }


                /* =========================
                   SUCCESS
                ========================= */

                formStatus.textContent =
                    "✓ Your message has been sent successfully. I'll get back to you soon.";

                formStatus.className =
                    "form-status success";


                /* Clear form */

                contactForm.reset();


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                formStatus.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                formStatus.className =
                    "form-status error";


            } finally {

                /* =========================
                   RESTORE BUTTON
                ========================= */

                submitButton.disabled = false;

                submitButton.textContent =
                    "Send Message →";

            }

        }
    );


    /* =========================
       FORM ERROR HELPER
    ========================= */

    function showFormError(message) {

        formStatus.textContent =
            message;

        formStatus.className =
            "form-status error";

    }

}