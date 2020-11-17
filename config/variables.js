
var ENV = process.env.ENVIRONMENT || 'prod';

module.exports = { 
    mongoURL        : (ENV === 'prod' ? process.env.MongoURI : process.env.MongoURILOCAL),
    mongoOptions    : { 
                        useNewUrlParser: true, 
                        useUnifiedTopology: true 
                      },
    mongoDB         : 'bigfoot'
    
};