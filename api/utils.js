
//---new class object for error handler---
class RouteError {
    constructor({ status, name, message }) {
        this.status = status;
        this.name = name;
        this.message = message;
    }
}

//--- set cors policy---
function setCorsPolicy(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
  };

//---middleware to check if user is set in request and returns 401 if not
function requireUser(req, res, next) {
    if (!req.user) {
        res.status(401);
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }


    next();
}

//---middleware for error handling - accepts RouteError object with name and message---
function errorHandler(err, req, res, next) {

    console.log(`ERROR: ${err.name} ${err.message}`)
    const status = err.status || 400
    res.status(status).send({name:err.name,message:err.message})
    next()
}


module.exports = {
    setCorsPolicy,
    requireUser,
    errorHandler,
    RouteError
}