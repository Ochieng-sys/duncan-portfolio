const express = require("express");

const router = express.Router();

const pool = require("../config/database");


/* =========================
   SUBMIT CONTACT FORM
========================= */

router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            service,
            message
        } = req.body;


        /* =========================
           VALIDATION
        ========================= */

        if (!name || !email || !message) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and message are required."

            });

        }


        /* =========================
           INSERT INTO DATABASE
        ========================= */

        const [result] = await pool.execute(

            `INSERT INTO contacts
            (name, email, service, message)
            VALUES (?, ?, ?, ?)`,

            [
                name,
                email,
                service || null,
                message
            ]

        );


        /* =========================
           SUCCESS RESPONSE
        ========================= */

        res.status(201).json({

            success: true,

            message:
                "Your message has been sent successfully.",

            contactId: result.insertId

        });


    } catch (error) {

        console.error(
            "Contact submission error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again."

        });

    }

});


module.exports = router;