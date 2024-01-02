const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const { request } = require("http");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const { error } = require("console");

//Set view Engine as EJS
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shhh! Some Secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
          password: password,
        },
      })
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return error;
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.post("/users", async (request, response) => {
  console.log("Firstname", request.body.firstName);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password,
    });
    request.login(user, (err) => {
      if (err) {
        console.error(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Sign Up",
    csrfToken: request.csrfToken(),
  });
});

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo Application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const Overdue = await Todo.getOverdues();
    const DueToday = await Todo.getDuetoday();
    const dueLater = await Todo.getDueLater();
    const Completed = await Todo.getCompletedTodos();
    if (request.accepts("html")) {
      response.render("todos", {
        title: "Todo Application",
        Overdue,
        DueToday,
        dueLater,
        Completed,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        Overdue,
        DueToday,
        dueLater,
        Completed,
      });
    }
  },
);

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  //Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: request.body.completed,
    });
    response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

//PUT localhost:3000/todos/:id/markAsCompleted as completed
app.put("/todos/:id", async (request, response) => {
  console.log("We have to update a todo with ID", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(!todo.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

// //Get todo by ID
// app.get("/todos/:id", async (request, response) => {
//   console.log("We have to get a todo with ID", request.params.id);
//   try {
//     const todo = await Todo.findByPk(request.params.id);
//     return response.json(todo);
//   } catch (error) {
//     console.log(error);
//     return response.status(442).json(error);
//   }
// });

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);

  try {
    await Todo.remove(request.params.id);
    return response.json({ success: "true" });
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

module.exports = app;
