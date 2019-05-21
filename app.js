const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();

const port = process.env.port || 8082;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

routes(app);    //importing routes - contains all requests - to be executed by this script

app.listen(port, function(error){
    if(error) return error;
    console.log(`[Server-log] : Application running on Port ${port}...`);
});

