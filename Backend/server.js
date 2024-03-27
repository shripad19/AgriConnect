const express = require("express");
const mongoose = require("mongoose");
const cropcoll = require("./models/cropcollection");
const pesticidescoll = require("./models/pesticidescollection");
const articlecoll = require("./models/article");
const cors = require('cors');
const bodyPaser = require("body-parser");

const app = express();
app.use(express.json());
app.use(bodyPaser.urlencoded({extended:true}));
app.use(cors());
const port = 5000;

mongoose.connect("mongodb://localhost:27017/cropdb")
    .then(()=>{
        console.log("Connected to database");
    });

app.get("/",(req,res)=>{
    res.send("This is server");
});

app.post("/submitcrop",async(req,res)=>{
    console.log("request arrived");
    const response = new cropcoll(req.body);
    let result = await response.save();
    res.send({status:"ok",data:result});
});

app.post("/submitpesticide",async(req,res)=>{
    console.log("request arrived");
    const response = new pesticidescoll(req.body);
    let result = await response.save();
    res.send({status:"ok",data:result});
});

app.post("/savepost",async(req,res)=>{
    console.log("post saved successfully");
    const response = new articlecoll(req.body);
    let result = await response.save();
    res.send({status:"ok",data:result});
});

app.post("/searchpesticide",async(req,res)=>{
    console.log("request arrived");
    console.log(req.body.cropname);
    let response = await pesticidescoll.find({cropname:req.body.cropname});
    console.log(response[0]);
    res.send({status:"ok",data:response}); //sending response to from where this /searchpesticide was called in <PesticideGuide />
});

app.post("/fetchpost",async(req,res)=>{
    console.log("fetched post successfully");
    let response = await articlecoll.find();
    console.log(response);
    res.send({status:"ok",data:response}); //sending response to from where this /searchpesticide was called in <PesticideGuide />
});

app.post("/deletepost",async(req,res)=>{
    console.log("dropped post successfully");
    let response = await articlecoll.deleteOne({_id:req.body.id});
    console.log(response);
    res.send({status:"ok",data:response}); //sending response to from where this /searchpesticide was called in <PesticideGuide />
});

app.post("/updatepost",async(req,res)=>{
    console.log("Body"+req.body.username);
    let article = await articlecoll.findById(req.body.id);
    article.username = req.body.username;
    article.blogtitle = req.body.blogtitle;
    article.blogcontent = req.body.blogcontent;
    article = await article.save();
    console.log("edited successfully");
    res.send({status:"updated",data:article});
});

app.post("/cropsowingratio", async (req, res) => {
     const state = req.body.state;
     const crop = req.body.crop;
     let division = req.body.division;
    try {
        const counts = await Promise.all([
            // here division array implementation
            cropcoll.countDocuments({ state: state, cropname: crop,division:division[0]}),
            cropcoll.countDocuments({ state: state, cropname: crop ,division:division[1]}),
            cropcoll.countDocuments({ state: state, cropname: crop ,division:division[2]}),
            cropcoll.countDocuments({ state: state, cropname: crop ,division:division[3]}),
            cropcoll.countDocuments({ state: state, cropname: crop ,division:division[4]})
        ]);
        res.send({ status: "ok", data: counts });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }
});


app.post("/statecropreview", async (req, res) => {
    const state = req.body.state;
    const crops = req.body.crops;
    const crop = Object.keys(crops);
   try {
       const counts = await Promise.all([
           cropcoll.countDocuments({ state: state, cropname: crop[0]}),
           cropcoll.countDocuments({ state: state, cropname: crop[1]}),
           cropcoll.countDocuments({ state: state, cropname: crop[2]}),
           cropcoll.countDocuments({ state: state, cropname: crop[3]}),
           cropcoll.countDocuments({ state: state, cropname: crop[4]})
       ]);
       res.send({ status: "ok", data: counts });
   } catch (error) {
       console.error("Error occurred:", error);
       res.status(500).send({ status: "error", message: "Internal server error" });
   }
});


app.post("/cropdivisionreview", async (req, res) => {
    const state = req.body.state;
    const crops = req.body.crops;
    const division = req.body.division;
   try {
       const counts = await Promise.all([
           // here division array implementation
           cropcoll.countDocuments({ state: state, cropname: crops[0] ,division:division}),
           cropcoll.countDocuments({ state: state, cropname: crops[1] ,division:division}),
           cropcoll.countDocuments({ state: state, cropname: crops[2] ,division:division}),
           cropcoll.countDocuments({ state: state, cropname: crops[3] ,division:division}),
           cropcoll.countDocuments({ state: state, cropname: crops[4] ,division:division})
       ]);
       res.send({ status: "ok", data: counts });
   } catch (error) {
       console.error("Error occurred:", error);
       res.status(500).send({ status: "error", message: "Internal server error" });
   }
});


app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})
