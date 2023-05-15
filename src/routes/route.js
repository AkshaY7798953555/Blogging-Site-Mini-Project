const express = require('express');
const controller = require('../controller/userController.JS');
const router =express.Router();
const midware = require("../middleware/middleware")
const textmodel = require("../models/textmodel")

//_____________CREAT AUTHOR__________________________
router.post("/authors", controller.createAuthor)
//_____________LOGIN__________________________

router.post("/login", controller.authorLogin)
//_____________CREAT BLOGS__________________________

router.post("/blogs",midware.auth, controller.createblog)
//_____________GET BLOGS__________________________

router.get("/blogs",midware.auth, controller.getBlog)
//_____________UPDATE BLOGS__________________________

router.put("/blogs/:blogId",midware.auth, controller.updateBlog)
//_____________DELET BLOGS PATH PARAM__________________________

router.delete("/blogs/:blogId",midware.auth, controller.deleteBlog)
//_____________DELET BLOGS QUERY PARAM__________________________

router.delete("/blogs",midware.auth, controller.deleteBlogs)
// ===============PRACTICE==================
router.post('/testcreate', async function (req,res){
    let data = req.body;
    let create = await textmodel.create(data)
    res.send({status:true,data: create})
})

router.get('/akshay',async function (req,res){
    let data = await textmodel.find({name:{$in : ["akshay","sahu",]}, attendance : {$eq :85 },rollNumber:{$eq :13}})
    res.send({data: data})

})
// fetch all the document, whose name is not akshay and sahu 
// fetch all document whose name is akshay or sahu and attendance is not equal to 85 and roll no.



module.exports=router