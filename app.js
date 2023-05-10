const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./configs/config.js");
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});
const twvoucher = require('./apis/truewallet.js');

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

app.post('/redeem', urlEncoded, async(req, res) =>{
    
    const { url } = await req.body ?? {};
    if(typeof url === "undefined") {
        return res.json({
            status: "FAIL",
            error: "Aungpao URL not found",
        });
    }

    await twvoucher(config.phoneNumber, url).then(async redeemed => {
        res.render('thankyou.ejs',{
            amount: String(redeemed.amount),
            from: String(redeemed.owner_full_name),
        });
    }).catch(err => {
        console.log(err);
        res.render('giveme.ejs', {
            error: "😭 เเง่ๆ หนูจะเอาอั่งเปา หนูอยากได้ตัง 😭",
        });
    });
});

app.get('/src', (req, res) =>{
    return res.redirect("https://github.com/ImJustNon/give-me-aungpao");
});


// ======================================================= api =======================================================
// get method 
app.get('/api/redeem', urlEncoded, async(req, res) =>{
    const { url } = req.query ?? {};

    if(!url){
        return res.json({
            status: "FAIL",
            error: "url was not found",
        }); 
    }
    await twvoucher(config.phoneNumber, url).then(async redeemed => {
        return res.json({
            status: "SUCCESS",
            error: null,
            data: {
                amount: String(redeemed.amount),
                from: String(redeemed.owner_full_name),
            },
        });
    }).catch(err => {
        return res.json({
            status: "FAIL",
            error: err,
        });
    });
});
// post method
app.post('/api/redeem', urlEncoded, async(req, res) =>{
    const { url } = await req.body ?? {};
    
    if(!url){
        return res.json({
            status: "FAIL",
            error: "url was not found",
        }); 
    }
    await twvoucher(config.phoneNumber, url).then(async redeemed => {
        return res.json({
            status: "SUCCESS",
            error: null,
            data: {
                amount: String(redeemed.amount),
                from: String(redeemed.owner_full_name),
            },
        });
    }).catch(err => {
        return res.json({
            status: "FAIL",
            error: err,
        });
    });
});
// ======================================================= api =======================================================



app.listen(config.app.port, ()=>{
    console.log(`[APP] Listening on port : ${config.app.port}`);
});