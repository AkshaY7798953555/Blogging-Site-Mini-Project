const express = require('express');
const controller = require('../controller/userController.JS');
const router =express.Router();
const midware = require("../middleware/middleware")



//__________________CREATE AUTHOR__________________________
router.post('/createauthormodel',controller.createAuthor);
//__________________CREATE BLOG____________________________
router.post('/createblog',midware.authenticate,controller.createblog);
//__________________GET BLOG_______________________________
router.get("/getBlog", midware.authenticate,controller.getBlog)
//__________________UPDATE BLOG____________________________
router.put("/updateBlog", midware.authorisation,controller.updateBlog)
//__________________deleteBlog pathparam ____________________
router.delete("/deleteBlog/:blogId",midware.authorisation, controller.deleteBlogs)
//__________________deleteBlog queryparam____________________
router.delete("/deleteBlogs",midware.authorisation, controller.deleteBlogs)
//__________________LOGIN USER________________________________
router.post("/loginUser", controller.loginuseer)


module.exports=router