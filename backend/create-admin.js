require("dotenv").config();

const bcrypt = require("bcryptjs");

const pool = require("./config/database");


async function createAdmin() {

    try {

        const email =
            process.env.ADMIN_EMAIL;

        const password =
            process.env.ADMIN_PASSWORD;


        if (!email || !password) {

            throw new Error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
            );

        }


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const [existing] =
            await pool.execute(
                "SELECT id FROM admins WHERE email = ?",
                [email]
            );


        if (existing.length > 0) {

            await pool.execute(
                `
                UPDATE admins
                SET password_hash = ?
                WHERE email = ?
                `,
                [
                    passwordHash,
                    email
                ]
            );

            console.log(
                "Admin password updated successfully."
            );

        } else {

            await pool.execute(
                `
                INSERT INTO admins
                (email, password_hash)
                VALUES (?, ?)
                `,
                [
                    email,
                    passwordHash
                ]
            );

            console.log(
                "Admin account created successfully."
            );

        }


        console.log(
            `Admin email: ${email}`
        );


    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );

    } finally {

        await pool.end();

    }

}


createAdmin();