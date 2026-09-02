const cookieParser = require("cookie-parser");

const {
    router: authRoutes,
    authenticate
} = require("./routes/auth");

const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const pool = require("./config/database");

const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");

const app = express();

const PORT = process.env.PORT || 5000;


/* =========================
   MIDDLEWARE
========================= */

app.use(cookieParser());

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

/* =========================
   SERVE WEBSITE
========================= */

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/admin", adminRoutes);

/* =========================
   API STATUS
========================= */

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        message: "OD Services backend is running."
    });

});


/* =========================
   DATABASE TEST
========================= */

app.get("/api/database-test", async (req, res) => {

    try {

        const [rows] = await pool.query(
            "SELECT 1 AS result"
        );

        res.json({

            success: true,

            message:
                "MySQL connection successful.",

            data: rows

        });

    } catch (error) {

        console.error(
            "Database connection error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to connect to MySQL."

        });

    }

});


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `OD Services backend running on port ${PORT}`
    );

});