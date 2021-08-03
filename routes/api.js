const express = require("express");
const apiController = require('../controllers/api')
const router = express.Router();

router.route('/')
    .get(apiController.getApi)

router.route('/:id').get(apiController.getCampApi)

module.exports = router;