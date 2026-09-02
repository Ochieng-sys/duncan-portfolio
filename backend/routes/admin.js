const {
    authenticate
} = require("./auth");

const express = require("express");

const router = express.Router();

const pool = require("../config/database");


/* =========================
   DASHBOARD STATISTICS
========================= */

router.get(
    "/stats",
    authenticate,
    async (req, res) => {

    try {

        const [rows] = await pool.query(`
            
            SELECT

                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN status = 'new'
                        THEN 1
                        ELSE 0
                    END
                ) AS newCount,

                SUM(
                    CASE
                        WHEN status = 'read'
                        THEN 1
                        ELSE 0
                    END
                ) AS readCount,

                SUM(
                    CASE
                        WHEN status = 'replied'
                        THEN 1
                        ELSE 0
                    END
                ) AS repliedCount

            FROM contacts

        `);


        res.json({

            success: true,

            stats: {

                total:
                    Number(rows[0].total) || 0,

                new:
                    Number(rows[0].newCount) || 0,

                read:
                    Number(rows[0].readCount) || 0,

                replied:
                    Number(rows[0].repliedCount) || 0

            }

        });


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve dashboard statistics."

        });

    }

});

/* =========================
   DASHBOARD STATISTICS
========================= */

router.get(
    "/stats",
    authenticate,
    async (req, res) => {

        try {

            const [rows] = await pool.execute(`
                SELECT
                    COUNT(*) AS total,
                    SUM(status = 'new') AS new,
                    SUM(status = 'read') AS read,
                    SUM(status = 'replied') AS replied
                FROM contacts
            `);


            const stats = rows[0];


            res.json({

                success: true,

                stats: {

                    total:
                        Number(stats.total) || 0,

                    new:
                        Number(stats.new) || 0,

                    read:
                        Number(stats.read) || 0,

                    replied:
                        Number(stats.replied) || 0

                }

            });


        } catch (error) {

            console.error(
                "Statistics error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load statistics."

            });

        }

    }
);

/* =========================
   RECENT ENQUIRIES
========================= */

router.get(
    "/recent-enquiries",
    authenticate,
    async (req, res) => {

        try {

            const [enquiries] =
                await pool.execute(`
                    SELECT
                        id,
                        name,
                        email,
                        service,
                        message,
                        status,
                        created_at
                    FROM contacts
                    ORDER BY created_at DESC
                    LIMIT 10
                `);


            res.json({

                success: true,

                enquiries

            });


        } catch (error) {

            console.error(
                "Recent enquiries error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load enquiries."

            });

        }

    }
);

/* =========================================
   GET SINGLE ENQUIRY
========================================= */

router.get(
    "/enquiries/:id",
    authenticate,
    async (req, res) => {

        try {

            const { id } = req.params;


            const [rows] =
                await pool.execute(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        service,
                        message,
                        status,
                        created_at
                    FROM contacts
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );


            if (rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Enquiry not found."

                });

            }


            res.json({

                success: true,

                enquiry: rows[0]

            });


        } catch (error) {

            console.error(
                "Single enquiry error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load enquiry."

            });

        }

    }
);

/* =========================================
   UPDATE ENQUIRY STATUS
========================================= */

router.patch(
    "/enquiries/:id/status",
    authenticate,
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { status } =
                req.body;


            const allowedStatuses = [
                "new",
                "read",
                "replied"
            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid enquiry status."

                });

            }


            const [result] =
                await pool.execute(
                    `
                    UPDATE contacts
                    SET status = ?
                    WHERE id = ?
                    `,
                    [
                        status,
                        id
                    ]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Enquiry not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Enquiry status updated.",

                status

            });


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update status."

            });

        }

    }
);

/* =========================================
   DELETE ENQUIRY
========================================= */

router.delete(
    "/enquiries/:id",
    authenticate,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const [result] =
                await pool.execute(
                    `
                    DELETE FROM contacts
                    WHERE id = ?
                    `,
                    [id]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Enquiry not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Enquiry deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete enquiry error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete enquiry."

            });

        }

    }
);

module.exports = router;
