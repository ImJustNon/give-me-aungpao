const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./configs/config.js");
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});
const truewallet = require('./apis/truewallet');

app.use(express.json({
    limit: '50mb',
}));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'./public')));
app.use(express.static(path.join(__dirname,'./node_modules')));


app.get('/', async(req, res) =>{
    res.render('giveme.ejs', {
        error: null,
    });
});

app.post('/redeem', async(req, res) =>{
    
    const { url } = req.body;

    if(typeof url === "undefined") return res.json({
        status: "FAIL",
        error: "Aungpao URL not found",
    });

    await truewallet.redeemvouchers(config.phoneNumber, url).then(async response => {
        if(response.status === "SUCCESS"){
            res.render('thankyou.ejs',{
                amount: String(response.amount),
            });
        }
        else if(response.status === "FAIL" || response.status === "ERROR"){
            res.render('giveme.ejs', {
                error: "😭 เเง่ๆ หนูจะเอาอั่งเปา หนูอยากได้ตัง 😭",
            });
        }
    });
});




app.listen(config.app.port, ()=>{
    console.log(`[APP] Listening on port : ${config.app.port}`);
});