const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const {default : mongoose} = require('mongoose');
mongoose.set('strictQuery', true);
const route = require('./src/routes/route');

app.use(express.json())

mongoose.connect("mongodb+srv://Akshay:akshay7798953554@akshaydb.e6tjw4w.mongodb.net/project1self", {
    useNewUrlParser: true
})

.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen( 3000, function(){
 console.log("server running on port"  + 3000);
}) 