/* =========================================
   OD SERVICES — ADMIN DASHBOARD
========================================= */


/* =========================================
   GLOBAL DATA
========================================= */

let allEnquiries = [];

let currentEnquiryId = null;


/* =========================================
   AUTHENTICATION CHECK
========================================= */

async function checkAuthentication() {

    try {

        const response = await fetch(
            "/api/auth/me"
        );

        if (!response.ok) {

            window.location.href =
                "/admin/login.html";

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        window.location.href =
            "/admin/login.html";

        return false;
    }
}


/* =========================================
   LOAD DASHBOARD
========================================= */

async function loadDashboard() {

    console.log(
        "Loading OD Services dashboard..."
    );

    try {

        await loadStatistics();

        await loadRecentEnquiries();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        const container =
            document.getElementById(
                "enquiries-container"
            );

        if (container) {

            container.innerHTML = `
                <p class="empty-message">
                    Unable to load enquiries.
                    Please refresh the dashboard.
                </p>
            `;
        }
    }
}


/* =========================================
   LOAD STATISTICS
========================================= */

async function loadStatistics() {

    const response = await fetch(
        "/api/admin/stats"
    );

    if (!response.ok) {

        throw new Error(
            `Statistics API returned ${response.status}`
        );
    }

    const data =
        await response.json();

    console.log(
        "Statistics received:",
        data
    );

    if (!data.success) {

        throw new Error(
            "Unable to load statistics."
        );
    }


    const total =
        document.getElementById(
            "total-enquiries"
        );

    const newCount =
        document.getElementById(
            "new-enquiries"
        );

    const read =
        document.getElementById(
            "read-enquiries"
        );

    const replied =
        document.getElementById(
            "replied-enquiries"
        );


    if (total) {

        total.textContent =
            data.stats.total;

    }


    if (newCount) {

        newCount.textContent =
            data.stats.new;

    }


    if (read) {

        read.textContent =
            data.stats.read;

    }


    if (replied) {

        replied.textContent =
            data.stats.replied;

    }
}


/* =========================================
   LOAD RECENT ENQUIRIES
========================================= */

async function loadRecentEnquiries() {

    const container =
        document.getElementById(
            "enquiries-container"
        );


    if (!container) {

        console.error(
            "Enquiries container not found."
        );

        return;
    }


    const response = await fetch(
        "/api/admin/recent-enquiries"
    );


    if (!response.ok) {

        throw new Error(
            `Enquiries API returned ${response.status}`
        );
    }


    const data =
        await response.json();


    console.log(
        "Enquiries received:",
        data
    );


    if (!data.success) {

        throw new Error(
            "Unable to load enquiries."
        );
    }


    /* =====================================
       STORE ENQUIRIES
    ===================================== */

    allEnquiries =
        data.enquiries || [];


    /* =====================================
       DISPLAY ENQUIRIES
    ===================================== */

    renderEnquiries();
}


/* =========================================
   RENDER ENQUIRIES
========================================= */

function renderEnquiries() {

    const container =
        document.getElementById(
            "enquiries-container"
        );


    const searchInput =
        document.getElementById(
            "enquiry-search"
        );


    const statusFilter =
        document.getElementById(
            "status-filter"
        );


    if (!container) {

        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        allEnquiries.filter(
            enquiry => {


                const name =
                    String(
                        enquiry.name || ""
                    ).toLowerCase();


                const email =
                    String(
                        enquiry.email || ""
                    ).toLowerCase();


                const service =
                    String(
                        enquiry.service || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    service.includes(search);


                const matchesStatus =
                    selectedStatus === "all" ||
                    enquiry.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    /* =====================================
       NO RESULTS
    ===================================== */

    if (filtered.length === 0) {

        if (allEnquiries.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No enquiries yet.
                </p>
            `;

        } else {

            container.innerHTML = `
                <p class="empty-message">
                    No enquiries match your search.
                </p>
            `;

        }

        return;
    }


    /* =====================================
       DISPLAY
    ===================================== */

    container.innerHTML =
        filtered
            .map(createEnquiryCard)
            .join("");
}


/* =========================================
   CREATE ENQUIRY CARD
========================================= */

function createEnquiryCard(enquiry) {

    const date =
        new Date(
            enquiry.created_at
        ).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    return `

        <article
            class="enquiry-card"
            data-enquiry-id="${enquiry.id}"
        >

            <div class="enquiry-main">

                <h3>
                    ${escapeHTML(
                        enquiry.name
                    )}
                </h3>


                <p class="enquiry-service">

                    ${escapeHTML(
                        enquiry.service ||
                        "General enquiry"
                    )}

                </p>


                <p class="enquiry-date">

                    ${date}

                </p>

            </div>


            <div class="enquiry-meta">

                <span
                    class="status status-${escapeHTML(
                        enquiry.status
                    )}"
                >
                    ${escapeHTML(
                        enquiry.status
                    )}
                </span>


                <button
                    type="button"
                    class="view-enquiry-button"
                    data-id="${enquiry.id}"
                >
                    View →
                </button>

            </div>

        </article>

    `;
}


/* =========================================
   HTML ESCAPING
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =========================================
   OPEN ENQUIRY
========================================= */

async function openEnquiry(id) {

    try {

        const response =
            await fetch(
                `/api/admin/enquiries/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load enquiry."
            );
        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load enquiry."
            );
        }


        const enquiry =
            data.enquiry;


        /* Store current enquiry */

        currentEnquiryId =
            enquiry.id;


        const modal =
            document.getElementById(
                "enquiry-modal"
            );


        if (!modal) {

            throw new Error(
                "Enquiry modal not found."
            );
        }


        /* =================================
           NAME
        ================================= */

        const name =
            document.getElementById(
                "modal-name"
            );


        if (name) {

            name.textContent =
                enquiry.name;

        }


        /* =================================
           SERVICE
        ================================= */

        const service =
            document.getElementById(
                "modal-service"
            );


        if (service) {

            service.textContent =
                enquiry.service ||
                "General enquiry";

        }


        /* =================================
           DATE
        ================================= */

        const date =
            document.getElementById(
                "modal-date"
            );


        if (date) {

            date.textContent =
                new Date(
                    enquiry.created_at
                ).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }


        /* =================================
           EMAIL
        ================================= */

        const email =
            document.getElementById(
                "modal-email"
            );


        if (email) {

            email.textContent =
                enquiry.email;

            email.href =
                `mailto:${enquiry.email}`;

        }


        /* =================================
           REPLY BUTTON
        ================================= */

        const replyButton =
            document.getElementById(
                "reply-email-button"
            );


        if (replyButton) {

            replyButton.href =
                `mailto:${enquiry.email}?subject=${encodeURIComponent(
                    "Re: " +
                    (
                        enquiry.service ||
                        "Your enquiry"
                    )
                )}`;

        }


        /* =================================
           MESSAGE
        ================================= */

        const message =
            document.getElementById(
                "modal-message"
            );


        if (message) {

            message.textContent =
                enquiry.message;

        }


        /* =================================
           STATUS
        ================================= */

        const status =
            document.getElementById(
                "modal-status"
            );


        if (status) {

            status.textContent =
                enquiry.status;

            status.className =
                `status status-${enquiry.status}`;

        }


        /* =================================
           STORE ID ON MODAL
        ================================= */

        modal.dataset.enquiryId =
            enquiry.id;


        /* =================================
           SHOW MODAL
        ================================= */

        modal.hidden = false;

    } catch (error) {

        console.error(
            "Open enquiry error:",
            error
        );

        alert(
            error.message ||
            "Unable to open this enquiry."
        );
    }
}


/* =========================================
   CLOSE ENQUIRY MODAL
========================================= */

function closeEnquiryModal() {

    const modal =
        document.getElementById(
            "enquiry-modal"
        );


    if (modal) {

        modal.hidden = true;

    }


    currentEnquiryId = null;
}


/* =========================================
   UPDATE ENQUIRY STATUS
========================================= */

async function updateEnquiryStatus(status) {

    const modal =
        document.getElementById(
            "enquiry-modal"
        );


    const id =
        modal?.dataset.enquiryId;


    if (!id) {

        alert(
            "No enquiry is currently selected."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/enquiries/${id}/status`,
                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update status."
            );
        }


        /* Update modal */

        const modalStatus =
            document.getElementById(
                "modal-status"
            );


        if (modalStatus) {

            modalStatus.textContent =
                status;

            modalStatus.className =
                `status status-${status}`;

        }


        /* Refresh dashboard */

        await loadDashboard();


        /* Keep modal open */

        if (modal) {

            modal.hidden = false;

        }

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update status."
        );
    }
}


/* =========================================
   DELETE ENQUIRY
========================================= */

async function deleteEnquiry() {

    const modal =
        document.getElementById(
            "enquiry-modal"
        );


    const id =
        modal?.dataset.enquiryId;


    if (!id) {

        alert(
            "No enquiry is currently selected."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this enquiry?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/enquiries/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete enquiry."
            );
        }


        closeEnquiryModal();


        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete enquiry error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete enquiry."
        );
    }
}


/* =========================================
   LOGOUT
========================================= */

async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        window.location.href =
            "/admin/login.html";
    }
}


/* =========================================
   DASHBOARD INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "OD Services admin.js loaded."
        );


        /* =================================
           FIND DASHBOARD
        ================================= */

        const enquiriesContainer =
            document.getElementById(
                "enquiries-container"
            );


        if (!enquiriesContainer) {

            return;
        }


        /* =================================
           AUTHENTICATION
        ================================= */

        const authenticated =
            await checkAuthentication();


        if (!authenticated) {

            return;
        }


        /* =================================
           LOAD DASHBOARD
        ================================= */

        await loadDashboard();


        /* =================================
           SEARCH
        ================================= */

        const searchInput =
            document.getElementById(
                "enquiry-search"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderEnquiries
            );

        }


        /* =================================
           STATUS FILTER
        ================================= */

        const statusFilter =
            document.getElementById(
                "status-filter"
            );


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderEnquiries
            );

        }


        /* =================================
           LOGOUT
        ================================= */

        const logoutButton =
            document.getElementById(
                "logout-btn"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );

        }


        /* =================================
           CLOSE MODAL
        ================================= */

        const closeButton =
            document.getElementById(
                "close-enquiry-modal"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeEnquiryModal
            );

        }


        /* =================================
           MARK AS READ
        ================================= */

        const markReadButton =
            document.getElementById(
                "mark-read-button"
            );


        if (markReadButton) {

            markReadButton.addEventListener(
                "click",
                () => {

                    updateEnquiryStatus(
                        "read"
                    );

                }
            );

        }


        /* =================================
           MARK AS REPLIED
        ================================= */

        const markRepliedButton =
            document.getElementById(
                "mark-replied-button"
            );


        if (markRepliedButton) {

            markRepliedButton.addEventListener(
                "click",
                () => {

                    updateEnquiryStatus(
                        "replied"
                    );

                }
            );

        }


        /* =================================
           DELETE
        ================================= */

        const deleteButton =
            document.getElementById(
                "delete-enquiry-button"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                deleteEnquiry
            );

        }

    }
);


/* =========================================
   VIEW ENQUIRY BUTTONS
========================================= */

document.addEventListener(
    "click",
    event => {

        const viewButton =
            event.target.closest(
                ".view-enquiry-button"
            );


        if (!viewButton) {

            return;
        }


        const id =
            viewButton.dataset.id;


        if (id) {

            openEnquiry(id);

        }

    }
);