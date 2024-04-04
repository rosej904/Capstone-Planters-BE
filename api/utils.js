
//---new class object for error handler---
class RouteError {
    constructor({status, name, message}) {
        this.status = status;
        this.name = name;
        this.message = message;
    }
}

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
function errorHandler (err, req, res, next) {
    console.log(`ERROR: ${err.name} ${err.message}`)
    const status = err.status || 400
    res.status(status).send(err.name+": "+err.message)
    next()
}


module.exports = {
    requireUser,
    errorHandler,
    RouteError
  }