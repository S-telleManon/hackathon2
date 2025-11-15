const express = require("express")
const app = express()
const path = require('path');


app.use(express.json());



const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1', // localhost
        user: 'postgres',
        password: 'postgres',
        database: 'jobs',
        port: 5432
    }
});

const bcrypt = require('bcrypt');
app.use(express.urlencoded({ extended: true }));






app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// app.get("/api/jobs",function(request, response){

//     knex.select('*').from('jobs')
//     .then(data => {
//         response.json(data)})
// })

// app.get('/api/jobs', (req, res) => {
//   res.json([
//     { 
//       id: 1, 
//       title: "Import Support Clerk", 
//       company_name: "ABZ Company Ltd", 
//       salary: "Rs 30,000-Rs 40,000", 
//       location: "Port Louis", 
//       published_date: "2025-11-10", 
//       deadline: "2025-11-20", 
//       categories: "Logistics/Courier"
//     }
//   ]);
// });

// --------------------------- All Jobs ---------------------------------
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await knex("jobs as j")
      .leftJoin("companies as co", "j.company_id", "co.id")
      .leftJoin("job_categories as jc", "j.id", "jc.job_id")
      .leftJoin("categories as c", "jc.category_id", "c.id")
      .select(
        "j.*",
        "co.name as company_name",
        knex.raw("COALESCE(string_agg(DISTINCT c.name, ', '), 'No Category') as categories")
      )
      .groupBy("j.id", "co.name")
      .orderBy("j.id");

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------Latest Jobs---------------------------------

app.get("/api/jobs/latest", function(request, response) {
knex("jobs").select("*").orderBy("published_date","desc").limit(5)
    .then(data => {
      response.json(data);
    })
    .catch(err => {
      console.error("Unable to display Latest Jobs",err);
      response.status(500).json({ ok:false,message: "Server Error" });
    });
});

// --------------------------- By category ---------------------------------
app.get("/api/jobs/category/:category_id", async (req, res) => {
  const categoryId = Number(req.params.category_id);
  if (isNaN(categoryId)) return res.status(400).json({ ok: false, message: "Invalid category ID" });

  try {
    const jobs = await knex('jobs as j')
      .leftJoin("companies as co", "j.company_id", "co.id")
      .select("j.*", "co.name as company_name")
      .where("j.category_id", categoryId);

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs by category:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
// --------------------------- Get job by ID ---------------------------------
app.get("/api/jobs/id/:id", async (req, res) => {
  const jobId = Number(req.params.id);
  if (isNaN(jobId)) return res.status(400).json({ ok: false, message: "Invalid job ID" });

  try {
    const job = await knex('jobs as j')
      .leftJoin('companies as co', 'j.company_id', 'co.id')
      .select('j.*', 'co.name as company_name')
      .where('j.id', jobId)
      .first();

    if (!job) return res.status(404).json({ ok: false, message: "Job not found" });

    res.json(job);
  } catch (err) {
    console.error("Error fetching job by ID:", err);
    res.status(500).json({ ok: false, message: "Server Error" });
  }
});
// --------------------------- Register as User ---------------------------------

app.post("/api/register", function(req,res){
    console.log("registering new member")
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
        if (password !== confirmPassword) {
        return res.status(400).json({ ok: false, message: 'Passwords do not match' });
        }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds)
        .then(function(password_hash) {
            // Insert into database
            return knex('users').insert({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password_hash: password_hash
            });
        })
        .then(function(data) {
            console.log(data);
            res.json({ status: "ok", data: data });
        })
        .catch(function(err) {
            console.error(err);
            res.status(500).json({ ok: false, message: 'Server error or email already exists' });
        });
});


// --------------------------- Login  ---------------------------------
const session = require('express-session');

app.use(session({
  secret: 'supersecretkey',  // change to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }   // true only if using HTTPS
}));

app.post("/api/login", function(req,res){
    console.log("loggin as existing member")
    const email = req.body.email;
    const password = req.body.password;

    if(!email||!password){
        return res.status(400).json({ok:false,message:"Email and Password required"})
    }
    
    knex('users').where({email}).first()
    .then(function(user){
        if(!user){
            return promise.reject({status:401,message:"Email or Password invalid"});
        }

        return bcrypt.compare(password, user.password_hash)
                .then(function (match) {
            if (!match) {
            return Promise.reject({ status: 401, message: "Invalid email or password" });
          }
          
          req.session.userId = user.id;
          req.session.email = user.email;

          
          return res.json({ ok: true, message: "Login successful", email: user.email});
        });
    })
    .catch(function (err) {
     
      if (err && err.status) {
        return res.status(err.status).json({ ok: false, message: err.message });
      }
      console.error('Login error:', err);
      return res.status(500).json({ ok: false, message: 'Server error' });
    });
});
app.get("/api/check-login", function (req, res) {
  if (req.session && req.session.userId) {
    return res.json({
      ok: true,
      loggedIn: true,
      email: req.session.email,
      role: req.session.role
    });
  }
  return res.json({ ok: true, loggedIn: false });
});

app.post('/api/logout', function(req, res) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ ok: false, message: 'Could not log out' });
      }
      // Optional: clear the cookie
      res.clearCookie('connect.sid', { path: '/' });
      return res.json({ ok: true, message: 'Logged out successfully' });
    });
  } else {
    res.json({ ok: true, message: 'No active session' });
  }
});
// --------------------------- Apply for Jobs  ---------------------------------
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "You must be logged in to apply" });
  }
  next();
}

// Save applied job
app.post("/api/save-job", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const jobId = req.body.job_id;

    if (!jobId) return res.status(400).json({ ok: false, message: "Job ID required" });

    const existing = await knex('applied_jobs').where({ user_id: userId, job_id: jobId }).first();

    if (existing) return res.status(200).json({ ok: false, message: "Already applied" });

    await knex('applied_jobs').insert({ user_id: userId, job_id: jobId });

    return res.json({ ok: true, message: "Job applied successfully" });

  } catch (err) {
    console.error('Error applying for job:', err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


// --------------------------- Get applied jobs for logged-in user ---------------------------------
app.get("/api/applied-jobs", async (req, res) => {
  try {
    
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ ok: false, message: "Not logged in" });

    // Get all applied jobs for this user
    const appliedJobs = await knex('applied_jobs as a')
      .leftJoin('jobs as j', 'a.job_id', 'j.id')
      .leftJoin('companies as co', 'j.company_id', 'co.id')
      .where('a.user_id', userId)
      .select(
        'j.id',
        'j.title',
        'j.salary',
        'j.published_date',
        'j.deadline',
        'j.location',
        'co.name as company_name'
      )
      .orderBy('j.published_date', 'desc');

    res.json({ ok: true, jobs: appliedJobs });
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ ok: false, message: "Server Error" });
  }
});

// go to localhost:5005/api/jobs
app.listen(5005, function(){
    console.log("server is running")
})