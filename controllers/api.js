const Campground = require("../models/campground");

module.exports.getApi = async(req, res, next) =>{
const data = await Campground.find({})
res.json(data)

}

module.exports.getCampApi = async(req, res, next) =>{
    const {id} = req.params;
    const data = await Campground.findById(id)
    res.json(data)
}