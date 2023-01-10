const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const jwt = require("jsonwebtoken");

//=================CREATE AUTHORS ==============================
const createAuthor = async function (req, res) {
  try {
      let data = req.body;
      if (!data.fname) return res.status(400).send({ status: false, message: "fname is necessary" });
      if (!data.lname) return res.status(400).send({ status: false, message: "lname is necessary" });
      if (!data.title) return res.status(400).send({ status: false, message: "title is necessary" });
      if (!(["Mr", "Mrs", "Miss"].includes(data.title))) return res.status(400).send({ status: false, message: "you can use only Mr, Mrs, Miss" })
      if (!data.email) return res.status(400).send({ status: false, message: "email is necessary" });
      if (!(data.email.match(/.+\@.+\..+/))) return res.status(400).send({ status: false, message: "invalid email" });
      let rawEmail = await authorModel.find({ email: data.email })
      if (rawEmail.length != 0) return res.status(400).send({ status: false, message: "email already exist" });
      if (!data.password) return res.status(400).send({ status: false, message: "password is necessary" });
      if(!(data.password.match(/(?=.{8,})/))) return res.status(400).send({status :false,error:"Password should be of atleast 8 charactors"})
      if(!(data.password.match(/.*[a-zA-Z]/))) return res.status(400).send({status :false,error:"Password should contain alphabets"})
      if(!(data.password.match(/.*\d/))) return res.status(400).send({status :false,error:"Password should contain digits"})
      let createdAuthor = await authorModel.create(data);
      res.status(201).send({ status: true, data: createdAuthor })
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}
//====================CREATE BLOGS ==============================

const createblog = async function (req, res) {
  try {
      let data = req.body;
      if (!data.title) return res.status(400).send({ status: false, message: "title is necessary" });
      if (!data.body) return res.status(400).send({ status: false, message: "body is necessary" });
      if (!data.authorId) return res.status(400).send({ status: false, message: "authorId is necessary" });
      if (!data.category) return res.status(400).send({ status: false, message: "category is necessary" });
      let validAuthor = await authorModel.findById(data.authorId)
      if (!validAuthor) return res.status(400).send({ status: false, msg: "invalid author Id" })
      if (typeof (data.tags) === String) data.tags = data.tags.split(",")
      if (typeof (data.subcategory) === String) data.subcategory = data.tags.split(",")
      let createdBlog = await blogModel.create(data);
      if (createdBlog.isDeleted == true) {
          await blogModel.findOneAndUpdate({ _id: createdBlog._id }, { deletedAt: Date.now() }, { upsert: true })
      }
      if (createdBlog.isPublished == true) {
          await blogModel.findOneAndUpdate({ _id: createdBlog._id }, { publishedAt: Date.now() }, { upsert: true })
      }
      res.status(201).send({ status: true, data: createdBlog })
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}

//===================== GET BLOG ================================

const getBlog = async function (req, res) {
  try {
      let data = req.query;
      data.isDeleted = false;
      data.isPublished = true;
      let blogs = await blogModel.find(data).populate('authorId')
      
      if (blogs.length == 0) return res.status(404).send({ msg: "No data found" });
      res.status(200).send({ status: true, data: blogs });

  } catch (error) {
      res.status(500).send({ status: false, message: error.message });
  }
}

//===================== UPDATE BLOG ================================

const updateBlog = async function (req, res) {
  try {
      let blogId = req.params.blogId;
      let data = req.body;
      let x = await blogModel.findById(blogId)
      if (!x) return res.status(404).send({ status: false, error: "No relevant data found by this Id" })
      if (x.authorId != req.authorId) return res.status(403).send({ status: false, error: "You are not allowed to perform this modification" })
      if(x.isDeleted == true) return res.status(404).send({ status: false, error: "Blogs doesnt exit" }) 
      if (x.isPublished == false) {
          data.isPublished = true;
          data.publishedAt = Date.now();
      }
      if (data.tags) {
          let tagsArr = x.tags;

          if (typeof (data.tags) == "string") {
              data.tags = data.tags.trim();
              tagsArr = [...tagsArr, ...data.tags.split(",")]
              console.log(tagsArr);

          }
          else {
              tagsArr=[...tagsArr,...data.tags]
          }
          data.tags = tagsArr
      }
      if (data.subcategory) {
          let subcategoryArr = x.subcategory;
          if (typeof (data.subcategory) === "string") {
              data.subcategory = data.subcategory.trim();
              subcategoryArr = [...subcategoryArr, ...data.subcategory.split(",")]
          }
          else {
              subcategoryArr=[...subcategoryArr,...data.subcategory]
          }
          data.subcategory = subcategoryArr

      }

  

      let updatedBlog = await blogModel.findByIdAndUpdate(blogId, { $set: data }, { new: true })
      res.status(200).send({ status: true, data: updatedBlog })
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}


//================================================DELETE BLOG BY ID=============================================================================
const deleteBlog = async function (req, res) {
  try {
      let data = req.params.blogId;
      let deletedBlog = await blogModel.findById(data)
      if (!deletedBlog) return res.status(404).send({ status: false, error: "No Data with this Id" })
      if (deletedBlog.authorId != req.authorId) return res.status(403).send({ status: false, error: "You are not allowed to perform this modification" })
      if (deletedBlog.isDeleted == true) return res.status(404).send({ status: false, error: "Blog doesn't exist" });
      await blogModel.findOneAndUpdate({ _id: data }, { isPublished: false, isDeleted: true, deletedAt: Date.now() }, { new: true });
      res.status(200).send("Sucessfully deleted")
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}


//===================================================DELETE BLOG BY FILTER=============================================================================
const deleteBlogs = async function (req, res) {
  try {
      let data = req.query;
      if(Object.keys(data).length == 0)return res.status(400).send({ status: false, error: "please provide a suitable filter condition" })

      let deletedBlog = await blogModel.find(data);
      

      if (deletedBlog.length == 0) return res.status(400).send({ status: false, error: "please provide a valid filter condition" })
      let deletedBlogs = deletedBlog.filter(x => x.authorId == req.authorId)

      if (deletedBlogs.length === 0) return res.status(403).send({ status: false, error: "You are not allowed to perform this modification" })
      let blogDeleted = deletedBlogs.filter(x => x.isDeleted == false)
      if (blogDeleted.length == 0) return res.status(404).send({ status: false, error: "Blog doesn't exist" })
      data.isDeleted = false;
      data.authorId = req.authorId
      let blogsDeleted = await blogModel.updateMany(data, { isPublished: false, isDeleted: true, deletedAt: Date.now() }, { new: true })
      res.status(200).send({ status: true, data: blogsDeleted })
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}
//===================== LOGIN USER================================

const authorLogin = async function (req, res) {
  try {
      let email = req.body.email;
      let password = req.body.password;
      if (!email) return res.status(400).send({ status: false, error: "UserId missing" });
      if (!password) return res.status(400).send({ status: false, error: "password missing" });
      let validUser = await authorModel.findOne({ email: email, password: password })
      if (!validUser) res.status(401).send({ status: false, error: "Invalid email or passwod" })
      const token = jwt.sign({ _id: validUser._id }, "Extra Secret String")
      res.set('x-api-key', token)
      res.status(200).send({ status: true, data: { "token": token } })
  } catch (error) {
      res.status(500).send({ status: false, message: error.message })
  }
}

module.exports.createAuthor = createAuthor;
module.exports.createblog = createblog;
module.exports.getBlog = getBlog;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteBlogs = deleteBlogs;
module.exports.authorLogin = authorLogin;
