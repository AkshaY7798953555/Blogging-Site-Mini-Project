const mongoose = require('mongoose');

const AKSHAYSchema = new mongoose.Schema({
    name : {
        type:String
    },
    attendance :{
        type :Number
    },
    rollNumber :{
        type :Number
    }

})
module.exports = mongoose.model('text', AKSHAYSchema)