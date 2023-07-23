// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));

// requiring db queries:
const { registerNewUser } = require('./db/queries/registerNewUser.js');


/*
-------------------------------------------------
LOGIN ROUTES FOR REFACTORING
-------------------------------------------------
*/
//require helper functions
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");  // for hashing passwords

app.use(cookieSession({
  name: 'session',
  keys: ['midterm'],
}));
const users = {};

const usersRoutes = require('./routes/users');
const homeRoute = require('./routes/home');
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout');
const registerRoute = require('./routes/register');


app.use('/users', usersRoutes);
app.use('/home', homeRoute);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
//app.use('/organization', organizationRoute);
//app.use('/account', accountRoute);
//app.use('/password', passwordRoutes);
app.use('/logout', logoutRoute);


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get('/', (req, res) => {
  const user = {};
  const templateVars = {
    user,
  };
  res.render('index', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// -------------------------------------------------
// TEMPORARY CODE HERE FOR FUNCTIONALITY WHILE WE BUILD THE DATABASE CONNECTIONS
// -------------------------------------------------


// EXPLANATION OF HOW EVERYTHING IS CONNECTING IN THE MEANTIME:

  /*
    recieve a response from the logout button from header partial
    that response will be a post request containing data (params)
    using this data we'll execute an SQL query in the database
    create a connection between the post request data and our database
    whatever psql returns, we can fetch that to process the data to our liking
    send that data ot an ejs file to process it for the front end
  */

  /*
    to connect to the database:
    refer to db/connection.
    db/connection is exporting and being referenced by the queries under db/query.
    reference db/queries/users.js to see a sample of this
    export helper functions from there to be used in our routes js files
    - this sample can be seen in the users-api.js file, where you can see
    the function/promise calling the function userQueries.getUsers()
    and process the data
    use re.render to display the data, res.json can send the data
  */


//-----------------------------------------------
// Register Routes
//-----------------------------------------------

// Register Button in Home Page
//----------------------------
app.post("/registerbutton", (req, res) => {
  res.redirect(`/register`);
});

// Register new user page
//---------------------------
app.get("/register", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
  };
  if (user_id) {
    res.redirect("/");
  } else {
    res.render("register", templateVars);
  }
});

// registration page submission post using database
//---------------------------
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = 101;

  const newUser = registerNewUser(firstName, lastName, email, password)
  .then((data) => {
    console.log("data params", data)
  })
  console.log(newUser);
});

// logout button in header
//---------------------------
app.post("/logout", (req, res) => {
  req.session = null
  res
    .redirect(301, '/login');
});
