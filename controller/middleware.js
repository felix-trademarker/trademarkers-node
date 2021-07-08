const jwt = require('jsonwebtoken')
var mcache = require('memory-cache');

exports.verify = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        //use the jwt.verify method to verify the access token
        //throws an error if the token has expired or has a invalid signature
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        next()
    }
    catch(e){
        console.log(e);
        //if an error occured return request unauthorized error
        res.redirect('/login'); 
        return res.status(401).send()
    }
}

exports.verifiedEmail = function(req, res, next){
    
    console.log('verified');
    let decode = jwt.decode(req.cookies.jwt, {complete: true});

    let user;
    if (decode && decode.payload.user) {
        user = JSON.parse(decode.payload.user);
        // console.log(user);
        if ( !user.email_verified_at ) {
            res.redirect('/customer/verify'); 
        }
    } else {
        // res.redirect('/customer/verify'); 
    }

    next()

}

exports.guardAdmin = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        let user = JSON.parse(payload.user);
        
        console.log('role',user.role);

        if ( user.role != "Admin" ) {
            res.redirect('/customer'); 
        }

        next()
    }
    catch(e){
        console.log(e);

        res.redirect('/home'); 
        return res.status(401).send()
    }
}

exports.guardResearcher = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        let user = JSON.parse(payload.user);
        
        console.log(user.role_id);

        if ( !user.role || user.role == "Customer" ) {
            res.redirect('/customer'); 
        }

        next()
    }
    catch(e){
        console.log(e);

        res.redirect('/home'); 
        return res.status(401).send()
    }
}

exports.guardReviewer = function(req, res, next){
    let accessToken = req.cookies.jwt

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){
        // return res.status(403).send()
        res.redirect('/login'); 
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        let user = JSON.parse(payload.user);
        
        console.log(user.role_id);

        if ( user.role_id != 5 ) {
            return res.status(403).send()
        }

        next()
    }
    catch(e){
        console.log(e);

        res.redirect('/login'); 
        return res.status(401).send()
    }
}

exports.cache = function(duration){
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
          res.send(cachedBody)
          return
        } else {
          res.sendResponse = res.send
          res.send = (body) => {
            mcache.put(key, body, duration * 1000);
            res.sendResponse(body)
          }
          next()
        }
    }
}