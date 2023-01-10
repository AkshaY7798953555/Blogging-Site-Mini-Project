const express = require('express');
const controller = require('../controller/userController.JS');
const router =express.Router();
const midware = require("../middleware/middleware")


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



module.exports=router