# Full-Stack-Dev-Project-

 A web application with CRUD functionality using Node runtime and Express framework
 
## Installation
 Command: npm install

## Setup (DATABASE)
 const dbConfig = {
    host: 'localhost',
    database: 'project2021',
    username: 'project2021',
    password: 'project2021',
    port: 3306
}

## Setup (EMAIL) - Incase google blocks the account for no reason
 const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
    user: 'CarlsJrY2S1@gmail.com',
    pass: "C@rlPass"
  }
});

### Running the server
 with nodemon: npm run devMode

 without nodemon: node server.js



![alt text](https://eservices.nyp.edu.sg/alls/images/Marketing%20NYP%20Logo_RGB.jpg)