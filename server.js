const express = require('express')
const mongoose = require('mongoose');
const msgModel = require('./model/message')
require("dotenv").config()
const port = process.env.PORT || 3000
const connection = process.env.CONNECTION || 'mongodb://127.0.0.1:27017/portfolioData'
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
    if(checkAdminReq(req.body.name, req.body.email, req.body.message)){
        res.status(200).send({
            "access" : req.body.message
        })
    }else{
        const message = new msgModel({
            "name" : req.body.name,
            "email" : req.body.email,
            "message" : req.body.message
        });
        await message.save().catch(err => {
            if(err){
                res.status(501).send('DB OFFLINE')
            }
        })
        res.status(200).send('Message Saved')

    }
    
})

app.delete('/messages/delete', valid, async(req, res) =>{
    await msgModel.findOneAndDelete({_id: req.body.id}, (err)=>{
        if(err){
            res.status(404).send('Not exists')
        }else{
            res.status(200).send('Successfully Deleted')
        }
    })
})

app.delete('/messages/deleteAll', valid, async(req, res) =>{
    await msgModel.deleteMany({}, (err)=>{
        if(err){
            res.status(404).send('Collection not exists')
        }else{
            res.status(200).send('Successfully Deleted')
        }
    })

})

app.post('/messages', async(req, res) =>{
    console.log(req.body.password)
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
    mongoose.connect(connection, {useNewUrlParser: true, useUnifiedTopology: true })

    mongoose.connection.once('open', function () {
        console.log("Connected to db");
    });
    mongoose.connection.on('error', err => {
        console.error(err);
    });
})

function checkAdminReq(name, email, msg){
    return (name === process.env.NAME && email === process.env.EMAIL && msg === process.env.ACCESS) ? true : false
}
function valid(req, res, next){
    if (req.body.password === process.env.ACCESS){
        next()
        return;
    }else{
        res.status(401).send('Incorrect Pass')
    }
}
