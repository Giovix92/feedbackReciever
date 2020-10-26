const express = require('express')
const mongoose = require('mongoose');
const msgModel = require('./model/message')
require("dotenv").config()
const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

const log = (req, res, next)=>{
    console.log(req.url);
    next();
}

const allowCrossOrigin = (req, res, next)=>{
    res.header('Access-Control-Allow-Origin', "*")
    next();
}
app.use(log)
app.use(allowCrossOrigin)

app.post('/send', async(req, res) =>{
    const message = new msgModel({
        "name" : req.body.name,
        "email" : req.body.email,
        "message" : req.body.message
    });

    await message.save().then(()=>{

        res.sendStatus(200)
    })
    .catch(err=>{
        console.error(err)
    })
})

app.get('/messages', async(req, res) =>{
    if(req.body.password != process.env.ACCESS){
        res.status(401).send('Incorrect Pass')
        return;
    }
    msgModel.find({}, (err, msges)=>{
        res.json(msges)
    })

})


app.listen(port, ()=>{
    console.log("Server started....")
    mongoose.connect(process.env.CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true })

    mongoose.connection.once('open', function () {
        console.log("Connected to db");
    });
    mongoose.connection.on('error', err => {
        console.error(err);
    });
})
