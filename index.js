const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bunyan = require("bunyan");

/**
 * Used for logging errors, warnings and information
 */
const logger = bunyan.createLogger({
    name: "login_app",
    streams: [
        {
            level: "info",
            path: "logs/info.log",
        },
        {
            level: "warn",
            path: "logs/warn.log",
        },
        {
            level: "error",
            path: "logs/error.log",
        },
    ],
});

/**
 * Connection with the MySQL database.
 */
const connection = mysql.createConnection({
    host: "localhost",
    user: "ulogin",
    password: "password",
    database: "login_app",
});

/**
 * Instantiate the app.
 *
 * Uses: session management, json, url encoding and EJS engine.
 */
const app = express();

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

/**
 * GET /
 *
 * Main route of the application, shows the index with the login status.
 */
app.get("/", (request, response) => {
    logger.info("visit to the site by", request.session.username);
    response.render("index", { session: request.session });
});

/**
 * GET /login
 *
 * Responds with the login form for the users to input their information.
 */
app.get("/login", (request, response) => {
    let success = request.query.success;
    if (success == "false") {
        response.render("login", { session: request.session, error: true });
    } else {
        response.render("login", { session: request.session, error: false });
    }
});

/**
 * GET /signup
 *
 * Responds with the signup form for new users to input their information.
 */
app.get("/signup", (request, response) => {
    let status = request.query.status;
    status = parseInt(status);
    response.render("signup", { session: request.session, status: status });
});

/**
 * GET /logout
 *
 * Destoys the user's session and redirects to the index page.
 */
app.get("/logout", (request, response) => {
    logger.info("user logged out: ", request.session.username);
    request.session.destroy();
    response.redirect("/");
});

/**
 * POST /register
 *
 * Registers new users by:
 *  - Validating that all fields were captured
 *  - Validating that password verification matches
 *  - Writing to database and checking for any errors (i.e. username taken)
 */
app.post("/register", (request, response) => {
    let username = request.body.username;
    let email = request.body.email;
    let password1 = request.body.password1;
    let password2 = request.body.password2;
    if (username && email && password1 && password2) {
        if (password1 != password2) {
            response.redirect("/signup?status=1");
            response.end();
            return;
        }
        connection.query(
            "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
            [username, password1, email],
            function (error, results, fields) {
                if (error) {
                    logger.error("Unable to write record to the database");
                    response.redirect("/signup?status=2");
                    response.end();
                    return;
                }
                logger.info("Succesful sign up for new user", username);
                response.redirect("/signup?status=3");
                response.end();
            }
        );
    } else {
        response.redirect("/signup?status=0");
        response.end();
    }
});

/**
 * POST /auth
 *
 * Performs user authentication by:
 *  - Validating that all fields were captured
 *  - Verifying that they match the record in the database
 *  - Creating the session and storing the username
 *  - Redirecting to index page
 */
app.post("/auth", (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    if (username && password) {
        connection.query(
            "SELECT * FROM accounts WHERE username = ? AND password = ?",
            [username, password],
            function (error, results, fields) {
                if (error) {
                    logger.error("Unable to reach database");
                    throw error;
                }
                if (results.length > 0) {
                    logger.info("Succesful authentication for user", username);
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.redirect("/");
                } else {
                    logger.warn("Authentication failed for user", username);
                    response.redirect("/login?success=false");
                }
                response.end();
            }
        );
    } else {
        response.redirect("/login?success=false");
        response.end();
    }
});

module.exports = app;
