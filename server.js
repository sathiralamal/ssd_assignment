const express = require('express')
const app = express()
const core = require("cors");
const bodyParser = require("body-parser");
const nHGet = require("./app");
const port = 3002
app.use(core());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/upload",function (req, res) {
    try {

        //var urls = req.body.url;
        var urls=["https://images.unsplash.com/photo-1633096613998-42001089ba89?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=686&q=80"]
        nHGet.Save(urls, (err) => {
            if (err)
            {
                
                console.log("error adding")
                
            } else{
                console.log("no error")
                
            }
            //res.send(200)
        }).then((val)=>{
            res.send("success")
        }).catch((err)=>{
            res.send("error")
        })
       


    } catch (e) {
        console.log("errot" + e);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})