var express = require('express');
var cors = require('cors')



var allowlist = ['https://www.trademarkers.com', 'https://trademarkers.com', 'http://localhost:4200', 'http://trademarkers.staging.test/']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
      console.log('called 1');
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    console.log('called else');
    corsOptions = { origin: false } // disable CORS for this request
  }

  console.log('called last');
  callback(null, corsOptions) // callback expects two parameters: error and options
}


const publicController = require('../controller/publicController')
const registerController = require('../controller/registerController')
const actionCodesController = require('../controller/actionCodesController')

const {verify, cache} = require('../controller/middleware');

var router = express.Router();

// DECLARE ROUTES WITH ASSIGNED CONTROLLERS
router.get('/video/:ytId', publicController.ytVideo);
router.get('/about', cache(60 * 60), publicController.about);
router.get('/terms', cache(60 * 60), publicController.terms);
router.get('/privacy', cache(60 * 60), publicController.privacy);

router.get('/cookies', cache(60 * 60), publicController.cookies);
router.get('/service_contract', cache(60 * 60), publicController.service_contract);
router.get('/resources', cache(60 * 60), publicController.resources);

router.get('/oppositions-and-proof-of-use', cache(60 * 60), publicController.oppositionProof);

router.get('/contact', publicController.contact);
router.post('/contact', publicController.submitContact);
router.get('/generate-pdf', publicController.generatePdf);
router.post('/generate-pdf', publicController.generatePdfView);
// router.get('/add-sender-pdf', publicController.addSenderPdf);
router.post('/add-sender-pdf', publicController.addSenderPdf);

router.get('/pdf/invoice/:orderNo', publicController.invoicePdf);

router.get('/', cache(60 * 60),publicController.home);

router.get('/what-is-the-uniform-domain-name-dispute-resolution-policy', publicController.udrp);
// router.get('/the-fourth-circuit-dismisses-nikes-appeal-over-injunction', publicController.fourthCircuit);
// router.get('/federal-circuit-affirms-ttab-decision', publicController.circuitAffirms);

// CUSTOM PAGE CHECKOUT --- START

router.get('/add-service-code-secret-132321', publicController.generateService);
router.post('/add-service-code-secret-132321-submit', publicController.generateServiceSubmit);

router.get('/checkout/L3P-5T', publicController.serviceOrderCustom);
router.post('/checkout/checkoutCustom', publicController.checkoutCustom);

router.get('/checkout/L3P-6T', publicController.serviceOrderCustom2);
router.post('/checkout/checkoutCustom2', publicController.checkoutCustom2);

router.get('/checkout/:serviceCode', publicController.serviceOrderShow);
router.post('/checkout/serviceOrderSubmit', publicController.serviceOrderSubmit);
router.post('/checkout/serviceordercustom', publicController.serviceOrderCustom3);

router.get('/tmreq/:serialNumber.us', cors(corsOptionsDelegate), publicController.checkTMApi);
router.post('/tmreq/:serialNumber.us', cors(corsOptionsDelegate), publicController.checkTMApi);



// CUSTOM PAGE CHECKOUT --- END

router.get('/search', publicController.searchSerial);
router.get('/us', publicController.searchSerial);
router.post('/search/serial-number', publicController.searchSerialNumber);

router.post('/checkout/:action', publicController.checkout);

router.post('/placeDeliveryOrder', publicController.checkoutDelivery);

router.get('/thank-you/:number', publicController.thankYou)

router.get('/delivery-method/:trdId', publicController.deliveryMethod)
router.get('/action/response/:action/:response', publicController.souResponse)



router.get('/trademark-assignment', publicController.assignment)

// WITH WILD CARD REGISTER CONTROLLER
// REMOVE OTHER FUNCTION UNDER PUBLIC TO REGISTER SPECIALLY THE SERVICE
// if ( process.env.ENVIRONMENT == "dev" ) {

  router.get('/trademark-:serviceType-in-:countryName-proceed', registerController.registrationProceed);
  router.get('/trademark-:serviceType-in-:countryName', registerController.registration);        

  router.post('/validate-order', registerController.validateOrder);    
  router.post('/trademark-profile', registerController.trademarkProfile);    
  router.post('/add-to-cart', registerController.addToCart);    
  router.get('/cart', verify,registerController.cart);    
  router.post('/cart/add-promo', verify, registerController.addCartPromo);    
  router.post('/cart/remove-promo', verify,registerController.removeCartPromo);    
  router.get('/checkout', registerController.checkout);    
  router.post('/placeorder', registerController.placeOrder);    
// }

router.get('/register', publicController.register);
router.post('/register', publicController.registerSubmit);

router.get('/forgot-password', publicController.forgotPassword);
router.post('/forgot-password', publicController.forgotPasswordSubmit);
router.get('/reset-password/:old/:email', publicController.forgotPasswordResetForm);
router.post('/reset-password/:old/:email', publicController.forgotPasswordResetFormSubmit);


// on dev
router.get('/countries', cache(60 * 60), publicController.countries);
router.get('/region/:abbr', cache(60 * 60), publicController.countriesAbbr);

router.get('/blog', cache(60 * 60), publicController.blog);
router.post('/blog', publicController.blog);
router.get('/blog/sitemap.xml', cache(60 * 60), publicController.blogXML);
router.get('/blog/:slug', publicController.blogPost);
router.get('/blog/:pageNo/:perPage', publicController.blog);

router.get('/prices', cache(60 * 60), publicController.prices);
router.get('/classes', cache(60 * 60), publicController.classes);
router.get('/classes/:id', publicController.classesId);
router.get('/class_descriptions', publicController.classDescription);
router.post('/class_descriptions', publicController.classDescription);
router.get('/videos', cache(60 * 60), publicController.videos);
router.get('/videos/:slug', publicController.videoDetails);

router.get('/monitoring-service', cache(60 * 60), publicController.monitoringService);
router.get('/services', cache(60 * 60), publicController.service);
router.get('/quote', cache(60 * 60), publicController.quote);
router.get('/quote/:type', publicController.quote);
router.post('/quote/submit', publicController.quoteSubmit);



router.get('/:actioncodes', actionCodesController.actionCodes);
router.get('/order/:actioncodes', actionCodesController.actionCodes);

router.get('/:actionCode/:type', publicController.codeLanding)
// action
router.get('/:action', publicController.redirect);
// redirect
// router.get('*', publicController.redirect);






module.exports = router;
