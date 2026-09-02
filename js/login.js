const loginForm =
    document.getElementById(
        "login-form"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "login-email"
                ).value.trim();


            const password =
                document.getElementById(
                    "login-password"
                ).value;


            const status =
                document.getElementById(
                    "login-status"
                );


            const button =
                document.getElementById(
                    "login-button"
                );


            button.disabled = true;

            button.textContent =
                "Signing in...";


            try {

                const response =
                    await fetch(
                        "/api/auth/login",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message
                    );

                }


                window.location.href =
                    "/admin/dashboard.html";


            } catch (error) {

                status.textContent =
                    error.message ||
                    "Login failed.";

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Login";

            }

        }
    );

}