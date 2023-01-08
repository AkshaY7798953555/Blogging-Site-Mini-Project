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
    if (!data.password) return res.status(400).send({ status: false, message: "password is necessary" });
    let createdAuthor = await authorModel.create(data);
    res.status(201).send({ status: true, data: createdAuthor })
} catch (error) {
    res.status(500).send({ status: false, msg: error.message })
}
};
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
    let createdBlog = await blogModel.create(data);
    if (createdBlog.isDeleted == true) {
        await blogModel.findOneAndUpdate({ _id: createdBlog._id }, { deletedAt: Date.now() }, { upsert: true })
    }
    if (createdBlog.isPublished == true) {
        await blogModel.findOneAndUpdate({ _id: createdBlog._id }, { publishedAt: Date.now() }, { upsert: true })
    }
    res.status(201).send({ status: true, data: createdBlog })
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message })
}
}

//===================== GET BLOG ================================

const getBlog = async function (req, res) {
  try {
    let data = req.query;
    data.isDeleted = false;
    data.isPublished = true;
    console.log(data);
    let blogs = await blogModel.find(data).populate("authorId");
    if (blogs.length == 0)
      return res.status(404).send({ msg: "No data found" });
    res.status(200).send({ status: true, data: blogs });
  } catch (error) {
    res.status(400).send({ status: false, msg: error.message });
  }
};

//===================== UPDATE BLOG ================================

const updateBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let data = req.body;
    let x = await blogModel.findById(blogId)
    if (!x) return res.status(404).send({ status: false, error: "No relevant data found by this Id" })
    if(x.authorId != req.body.authorId) return res.status(403).send({status:false,error:"You are not allowed to perform this modification"})
    if (x.isPublished == false) {
        data.isPublished = true;
        data.publishedAt = Date.now();
    }
    if (data.tags) {
      let tagsArr = x.tags;
      tagsArr.push(data.tags);
      data.tags = tagsArr;
    }

    if (data.subcategory) {
      let subcategoryArr = x.subcategory;
      subcategoryArr.push(data.subcategory);
      data.subcategory = subcategoryArr;
    }
    let updatedBlog = await blogModel.findByIdAndUpdate(blogId,{ $set: data },{ new: true });
    res.status(201).send({ status: true, data: updatedBlog });
  } catch (error) {
    res.status(400).send({ status: false, msg: error.message });
  }
};

//===================== deleteBlog  ================================

const deleteBlog = async function (req, res) {
  try {
    let data = req.params.blogId;
    let deletedBlog = await blogModel.findById(data)
    if (!deletedBlog) return res.status(404).send({ status: false, error: "No Data with this Id" })
    if(deletedBlog.authorId != req.body.authorId) return res.status(403).send({status:false,error:"You are not allowed to perform this modification"})
    if (deletedBlog.isDeleted == true) return res.status(404).send({status:false,error:"Blog doesn't exist"});
    await blogModel.findOneAndUpdate({ _id: data }, { isDeleted: true, deletedAt: Date.now() }, { new: true });
    res.status(200).send("Sucessfully deleted")
} catch (error) {
    res.status(500).send({ status: false, msg: error.message })
}
}
//===================== deleteBlog queryparam================================

const deleteBlogs = async function (req, res) {
  try {
    let data = req.query;
    let deletedBlog = await blogModel.updateMany(
      data,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    res.status(201).send({ status: true, data: deletedBlog });
  } catch (error) {
    res.status(400).send({ status: false, msg: error.message });
  }
};


//===================== LOGIN USER================================

const loginuseer = async function (req, res) {
  try {
    let username = req.body.email;
  let password = req.body.password;
  let user = await authorModel.findOne({ emailId: username , password: password});
  if (!user)
  return res.status(403).send({status: false,message: "userid and  password is not valid"});
  if (!username) return res.status(401).send({status:false,message:"username is mandatary"})
  if (!password) return res.status(401).send({status:false,message:"password is mandatary"})

  let token = jwt.sign (
    {
      authorId :user._id
      
    },
    "project1group9"
  );
  res.setHeader("x-api-key", token);
    
    res.status(201).send({ status: true, data: token });
  } catch (error) {
    res.status(400).send({ status: false, msg: error.message });
  }
  console.log("token is generated")
};

module.exports.createAuthor = createAuthor;
module.exports.createblog = createblog;
module.exports.getBlog = getBlog;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteBlogs = deleteBlogs;
module.exports.loginuseer = loginuseer;
