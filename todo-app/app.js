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
const bcrypt = require('bcrypt');

const saltRounds = 10;

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
          email: username
        },
      })
        .then(async (user) => {
          const result = await bcrypt.compare(password,user.password)
          if(result){
            return done(null, user);
          }else{
            return done("Invalid Password !");
          }
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
  const hashedPwd = await bcrypt.hash(request.body.password,saltRounds);
  console.log(hashedPwd);
  
  console.log("Firstname", request.body.firstName);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd
    });
    console.log(user);
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

app.get("/login",(request,response) => {
  response.render("login",{title: "Login",csrfToken: request.csrfToken()});
});

app.get("/signout",(request,response)=>{
  //Signout
  request.logout((err) => {
    if(err){
      return next(err); 
    };
    response.redirect("/");
  })
});

app.post("/session",passport.authenticate('local',{failureRedirect: "/login",failureFlash: true}) , (request,response) => {
  console.log(request.user);
  response.redirect("/todos");
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
  try{
      const [Overdue,DueToday,dueLater,Completed] = await Promise.all([Todo.getOverdues(),Todo.getDuetoday(),Todo.getDueLater(),Todo.getCompletedTodos()])
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
    }catch(error){
      console.error(error);
      response.status(500).send("Internal Server Error");
    }
});

app.get("/todos",connectEnsureLogin.ensureLoggedIn(),async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

app.post("/todos",connectEnsureLogin.ensureLoggedIn(),async (request, response) => {
  console.log("Creating a todo", request.body);
  const loggedInUser = request.params.id;
  //Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: request.body.completed,
      userId: loggedInUser
    });
    response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

//PUT localhost:3000/todos/:id/markAsCompleted as completed
app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
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

app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);
  const loggedInUser = request.user.id;
  try {
    await Todo.remove(request.params.id,loggedInUser);
    return response.json({ success: "true" });
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

module.exports = app;
