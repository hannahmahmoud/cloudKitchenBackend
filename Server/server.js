// importing pkges
let app= require('./../App/app');
let mongoose= require('mongoose');
let dotenv= require('dotenv');
dotenv.config({path:'config.env'});

const dns = require('dns');
// Force Node to use Google's public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);


//connecting the db
mongoose.connect(process.env.CONN_STR
).then ((connection)=>{
   //console.log(connection);
   console.log("Successful connection to mongoDB")
}).catch((err)=>{
   console.log("connection error: "+err);
});


// creating a server
//let port =process.env.port;
app.listen(process.env.PORT||4000,()=>{
    console.log("Server is connected ");
 
})