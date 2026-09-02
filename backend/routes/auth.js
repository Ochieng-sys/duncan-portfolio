const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

const router = express.Router();


/* =========================
   ADMIN LOGIN
========================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const [admins] =
            await pool.execute(
                `
                SELECT
                    id,
                    email,
                    password_hash
                FROM admins
                WHERE email = ?
                LIMIT 1
                `,
                [email]
            );


        if (admins.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const admin =
            admins[0];


        const passwordMatches =
            await bcrypt.compare(
                password,
                admin.password_hash
            );


        if (!passwordMatches) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const token =
            jwt.sign(

                {
                    adminId: admin.id,
                    email: admin.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "2h"
                }

            );


        res.cookie(
            "admin_token",
            token,
            {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge:
                    2 * 60 * 60 * 1000
            }
        );


        res.json({

            success: true,

            message:
                "Login successful."

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to process login."

        });

    }

});


/* =========================
   LOGOUT
========================= */

router.post("/logout", (req, res) => {

    res.clearCookie(
        "admin_token"
    );


    res.json({

        success: true,

        message:
            "Logged out successfully."

    });

});


/* =========================
   CHECK AUTHENTICATION
========================= */

router.get("/me", authenticate, (req, res) => {

    res.json({

        success: true,

        admin: {
            id: req.admin.adminId,
            email: req.admin.email
        }

    });

});


/* =========================
   AUTHENTICATION MIDDLEWARE
========================= */

function authenticate(req, res, next) {

    const token =
        req.cookies.admin_token;


    if (!token) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required."

        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.admin =
            decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired session."

        });

    }

}


module.exports = {
    router,
    authenticate
};