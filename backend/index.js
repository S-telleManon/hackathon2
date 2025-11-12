const express = require("express")
const app = express()
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));


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


app.get("/api/jobs/:category_id", function(request, response) {
  const categoryId = Number(request.params.category_id); 

  knex('jobs as j')
    .leftJoin("companies as co", "j.company_id", "co.id")
    .select("j.*", "co.name as company_name")
    .where("j.category_id", categoryId)
    .then(data => {
      response.json(data);
    })
    .catch(err => {
      console.error(err);
      response.status(500).json({ message: "Server Error" });
    });
});

// app.post("/api/students", function(request,response){
//     console.log("receiving student to create")
//     console.log(request.body)
//     console.log(request.body.name)
//     // INSERT INTO students (name) VALUES ("Sarah") RETURNING name,id,nic
//     knex('students').returning(['name', 'id', 'nic']).insert(
//         {
//             name:request.body.name,
//             nic: request.body.nic
//         }
//     ).then(data => {console.log(data)
//         response.json({'status':"ok","data":data})
//     })
// })

// app.put("/api/students/:id",(req,res) => {
    
//     const student_id = req.params.id
//     const new_data = req.body

//     console.log(student_id,new_data)

//     // UPDATE students SET name = "Ritesh Smith" WHERE id = {id}
//     knex('students').where({id:9}).update(req.body).returning('*').then(function(data){
//         console.log(data)
//         res.json({'status':"ok","data":data})
//     })
// })

// app.delete("/api/students/:id", (req,res) => {
//     const student_id = req.params.id
//     // DELETE FROM students WHERE id={id}
//     knex('students').where({id:student_id}).del().then(function(data) {
//         res.json({'status':"ok"})
//     })
// })

// app.get("/api/posts", (req,res) => {
//     axios.get('https://jsonplaceholder.typicode.com/posts').then(function(data){
//         console.log(data['data'])
//         res.json(data['data'])
//     })    
// })



// go to localhost:5005/api/students
app.listen(5005, function(){
    console.log("server is running")
})