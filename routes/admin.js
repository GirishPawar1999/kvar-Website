const express = require("express");
const { Store } = require("express-session");
const res = require("express/lib/response");
const { model } = require("mongoose");
multer = require("multer");
router = express.Router();
path = require("path");
const objectstocsv =require('objects-to-csv');
fs = require("fs");
const Handlebars = require('handlebars');
nodemailer = require("nodemailer");
transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.KVAR_FROM,
    pass: process.env.PASS,
  },
});
const { parse } = require("csv-parse");

var FroalaEditor = require('../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js');

storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/img");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage1 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/brochures");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/gallery/imgs");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage3 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/gallery/vids");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage4 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/gallery/presentation");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage5 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/blogs");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage6 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/Dev");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
storage7 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/Careers");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

storage8 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/EmailersDb");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

storage9 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/EmailImage");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
upload = multer({ storage: storage });
upload1 = multer({ storage: storage1 });
upload2 = multer({ storage: storage2 });
upload3 = multer({ storage: storage3 });
upload4 = multer({ storage: storage4 });
upload5 = multer({ storage: storage5 });
upload6 = multer({ storage: storage6 });
upload7 = multer({ storage: storage7 });
upload8 = multer({ storage: storage8 });
upload9 = multer({ storage: storage9 });
bcrypt = require("bcrypt");
query = require("../DBqueries");
constant = require("../constant");

const EmailersDir = path.join(__dirname, "../public/EmailersDb");
const directoryPath = path.join(__dirname, "../public/brochures");
const galleryPathImages = path.join(__dirname, "../public/gallery/imgs");
const galleryPathVideos = path.join(__dirname, "../public/gallery/vids");
const CmailPathImages = path.join(__dirname, "../public/EmailImage");

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) return res.redirect("/admin/login");
  next();
};

navigation_content();

/*router.get('/example',function(req,res){
    res.render('admin/example')
})*/
router.get("/", requireLogin, async function (req, res) {
  let productsCatWise = await query.fetchAllProducts(true);
  res.render("admin/index", {
    user: "yash",
    productsCatWise: productsCatWise,
  });
});

router.get("/addProduct", requireLogin, async function (req, res) {
  let categories = await query.fetchAllCategories();
  console.log("category" + categories);
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    let brochures = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      brochures.push(file);
    });
    res.render("admin/addProduct", {
      insertRequest: false,
      brochures: brochures,
      categories: categories,
    });
  });
});

router.get("/products/:id/addmodel", requireLogin, function (req, res) {
  res.render("admin/addModel", { id: req.params.id, insertRequest: false });
});

router.post(
  "/products/:id/addModel",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    let model = req.body.model;
    model.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    let id = await query.addModel(req.params.id, model);
    res.redirect("/admin/products/" + req.params.id);
  }
);

router.get("/addCategory", requireLogin, async function (req, res) {
  res.render("admin/addCategory");
});

router.post(
  "/addProduct",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    let product = req.body.product;
    console.log(req.body);
    product.details = convert_to_object(product.details);
    product.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    let id = await query.addProduct(product);
    await navigation_content();
    res.redirect("products/" + id);
  }
);

router.post(
  "/addCategory",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    var category = req.body.category;
    category.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    var id = await query.addCategory(category);
    await navigation_content();
    res.redirect("categories/" + id);
  }
);

router.get("/addBSeller", requireLogin, async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllProducts(false);
  var page_count = Math.ceil(val.length / 10);

  let products = val
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    .slice(page * 10 - 10, page * 10);
  res.render("admin/addBSeller", {
    products: products,
    page_count: page_count,
    cur_page: page,
  });
});

router.post("/addBSeller", requireLogin, async function (req, res) {
  var val = await query.searchProducts(req.body.name);
  res.render("admin/addBSeller", {
    products: val,
  });
});

router.post("/addBSeller/:id", requireLogin, async function (req, res) {
  var val = await query.addBSeller(req.params.id);
  res.redirect("../BSellers");
});

router.get("/BSellers", requireLogin, async function (req, res) {
  var val = await query.fetchBSellers();
  res.render("admin/viewBSellers", {
    products: val,
  });
});

router.post("/removeBSeller/:id", requireLogin, async function (req, res) {
  var val = await query.removeBSeller(req.params.id);
  res.redirect("../BSellers");
});

router.get("/products", requireLogin, async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllProducts(false);
  var page_count = Math.ceil(val.length / 10);

  let products = val
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    .slice(page * 10 - 10, page * 10);
  res.render("admin/viewProducts", {
    products: products,
    page_count: page_count,
    cur_page: page,
  });
});

router.post("/products", requireLogin, async function (req, res) {
  var val = await query.searchProducts(req.body.name);
  res.render("admin/viewProducts", {
    products: val,
  });
});

router.get("/categories", requireLogin, async function (req, res) {
  var val = await query.fetchAllCategories();
  res.render("admin/viewCategories", {
    categories: val,
  });
});

router.get("/products/:id", requireLogin, async function (req, res) {
  var product = await query.fetchProduct(req.params.id);
  console.log(product);
  res.render("admin/viewProduct", {
    product: product,
  });
});

router.get("/products/:id/models", requireLogin, async function (req, res) {
  var models = await query.fetchAllModels(req.params.id);
  res.render("admin/viewModels", { models: models, product_id: req.params.id });
});

router.get("/categories/:id", requireLogin, async function (req, res) {
  var category = await query.fetchCategory(req.params.id);
  res.render("admin/viewCategory", {
    category: category,
  });
});

router.get("/products/:id/edit", requireLogin, async function (req, res) {
  var val = await query.fetchProduct(req.params.id);
  var categories = await query.fetchAllCategories();
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    var brochures = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      brochures.push(file);
    });
    console.log(brochures);
    res.render("admin/editProduct", {
      updateRequest: false,
      product: val,
      brochures: brochures,
      categories: categories,
    });
  });
});

router.get("/categories/:id/edit", requireLogin, async function (req, res) {
  var val = await query.fetchCategory(req.params.id);
  res.render("admin/editCategory", {
    updateRequest: false,
    category: val,
  });
});

router.get(
  "/products/:product_id/models/:id/edit",
  requireLogin,
  async function (req, res) {
    var model = await query.fetchModel(req.params.product_id, req.params.id);
    res.render("admin/editModel", {
      updateRequest: false,
      product_id: req.params.product_id,
      model: model,
    });
  }
);

router.put(
  "/products/:product_id/models/:model_id/edit",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    var uploadImages = [];
    var deleteImages = [];
    var model = req.body.model;
    if (req.files)
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
    if (req.body.deleteImages) deleteImages = req.body.deleteImages;
    model.uploadImages = uploadImages;
    model.deleteImages = deleteImages;
    var val = await query.updateModel(
      req.params.product_id,
      req.params.model_id,
      model
    );
    res.redirect("../../../../products/" + req.params.product_id);
    if (val) {
      deleteImages.forEach((image) => {
        fs.unlink("public/img/" + image, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
    }
  }
);

router.put(
  "/products/:id/edit",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    var uploadImages = [];
    var deleteImages = [];
    var product = req.body.product;
    product.details = convert_to_object(product.details);
    if (req.files)
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
    if (req.body.deleteImages) deleteImages = req.body.deleteImages;
    product.uploadImages = uploadImages;
    product.deleteImages = deleteImages;
    var val = await query.updateProduct(req.params.id, product);
    await navigation_content();
    res.redirect("../../products/" + req.params.id);
    if (val) {
      deleteImages.forEach((image) => {
        fs.unlink("public/img/" + image, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
    }
  }
);

router.put(
  "/categories/:id/edit",
  requireLogin,
  upload.array("images"),
  async function (req, res) {
    var uploadImages = [];
    var deleteImages = [];
    var category = req.body.category;
    if (req.files)
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
    if (req.body.deleteImages) deleteImages = req.body.deleteImages;
    category.uploadImages = uploadImages;
    category.deleteImages = deleteImages;
    var val = await query.updateCategory(req.params.id, category);
    await navigation_content();
    res.redirect("../../categories/" + req.params.id);
    if (val) {
      deleteImages.forEach((image) => {
        fs.unlink("public/img/" + image, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
    }
  }
);

router.delete("/products/:id/delete", requireLogin, async function (req, res) {
  var val = await query.deleteProduct(req.params.id);
  await navigation_content();
  res.redirect("../../products");
  if (val[0] == true) {
    val[1].images.forEach((image) => {
      console.log("public/img/" + image.filename);
      fs.unlink("public/img/" + image.filename, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  }
});

router.delete(
  "/products/:product_id/models/:model_id/delete",
  requireLogin,
  async function (req, res) {
    var val = await query.deleteModel(
      req.params.product_id,
      req.params.model_id
    );
    res.redirect("../../../../products/" + req.params.product_id);
    if (val[0] == true) {
      val[1].images.forEach((image) => {
        console.log("public/img/" + image.filename);
        fs.unlink("public/img/" + image.filename, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
    }
  }
);

router.delete(
  "/categories/:id/delete",
  requireLogin,
  async function (req, res) {
    var val = await query.deleteCategory(req.params.id);
    await navigation_content();
    res.redirect("../../categories");
    if (val[0] == true) {
      val[1].images.forEach((image) => {
        console.log("public/img/" + image.filename);
        fs.unlink("public/img/" + image.filename, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
    }
  }
);

router.get("/brochures", requireLogin, function (req, res) {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    let brochures = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      brochures.push(file);
    });
    res.render("admin/brochures", {
      brochures: brochures,
    });
  });
});

router.get("/galleryImages", requireLogin, function (req, res) {
  fs.readdir(galleryPathImages, function (err, files) {
    //handling error
    let images = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      images.push(file);
    });
    res.render("admin/galleryImages", {
      images: images,
    });
  });
});

router.get("/galleryVideos", requireLogin, function (req, res) {
  fs.readdir(galleryPathVideos, function (err, files) {
    //handling error
    let videos = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      videos.push(file);
    });
    res.render("admin/galleryVideos", {
      videos: videos,
    });
  });
});

router.get("/addBrochure", requireLogin, function (req, res) {
  res.render("admin/addBrochure", {
    type: "Brochures",
    link: "/admin/addBrochure",
  });
});

router.get("/addGalleryImages", requireLogin, function (req, res) {
  res.render("admin/addBrochure", {
    type: "Images for Gallery",
    link: "/admin/addGalleryImages",
  });
});

router.get("/addGalleryVideos", requireLogin, function (req, res) {
  res.render("admin/addBrochure", {
    type: "Videos for Gallery",
    link: "/admin/addGalleryVideos",
  });
});

router.post(
  "/addBrochure",
  requireLogin,
  upload1.array("brochures"),
  function (req, res) {
    res.redirect("/admin/brochures");
  }
);

router.post(
  "/addGalleryImages",
  requireLogin,
  upload2.array("brochures"),
  function (req, res) {
    res.redirect("/admin/galleryImages");
  }
);

router.post(
  "/addGalleryVideos",
  requireLogin,
  upload3.array("brochures"),
  function (req, res) {
    res.redirect("/admin/galleryVideos");
  }
);

router.delete("/brochures/:name/delete", requireLogin, function (req, res) {
  fs.unlink("public/brochures/" + req.params.name, (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/admin/brochures");
  });
});

router.delete("/galleryImages/:name/delete", requireLogin, function (req, res) {
  fs.unlink("public/gallery/imgs/" + req.params.name, (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/admin/galleryImages");
  });
});

router.delete("/galleryVideos/:name/delete", requireLogin, function (req, res) {
  fs.unlink("public/gallery/vids/" + req.params.name, (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/admin/galleryVideos");
  });
});

router.get("/login", function (req, res) {
  let invalid = false;
  if (req.query.invalid) invalid = true;
  res.render("admin/login", { invalid: invalid });
});

router.post("/login", async function (req, res) {
  const pass = req.body.password;
  const admin = await query.getAdmin();
  const actualPass = admin.password;
  const id = admin._id;
  var valid = await bcrypt.compare(pass, actualPass);
  if (valid) {
    req.session.user_id = id;
    res.redirect("/admin");
  } else res.redirect("/admin/login?invalid=true");
});

router.get("/changePassword", requireLogin, function (req, res) {
  res.render("admin/changePassword");
});

router.post("/changePassword", requireLogin, async function (req, res) {
  const pass = req.body.password;
  const hash = await bcrypt.hash(pass, 12);
  updated = await query.updatePassword(hash);
  if (updated) res.redirect("/admin");
  else res.send("Error in updating");
});

router.post("/logout", requireLogin, function (req, res) {
  req.session.destroy();
  res.redirect("/admin/login");
});



//Add new devlopement
router.get("/addDev", requireLogin, async function (req, res) {  
  res.render("admin/addDev", {
    insertRequest: false,
  });
});



router.post("/addDev",requireLogin,upload6.array("image"),async function(req,res){
  let Dev = req.body.Dev;
  const DevEmail={};
    console.log(Dev);
    Dev.description = seperateParagraphs(Dev.description);
    Dev.image = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
  DevEmail.title=Dev.title;
  DevEmail.STS=false;
  console.log("EMAIL STS");
  console.log(DevEmail);
  //let temp={title:req.body.title,description:req.body.description,image:image};
  id = await query.addDev(Dev);  
  temp = await query.addEmailerSTS(DevEmail); 
  res.redirect("viewDev/" + id);
});

//View Development
router.get("/viewDev/:id",requireLogin,async function(req,res){
  let dev= await query.fetchDev(req.params.id);
  var findSTS = await query.fetchEmailSTS(dev.title);
  console.log("Emailer db");
  console.log(findSTS);
  console.log(dev);
  if(findSTS.STS){
    dev.status="Email Already Send :)";
  }else{
    dev.status="Email not Send :(";
  }
  res.render("admin/viewDev", {
    updateRequest: false,
    blog: dev,
  });
  //res.send(dev);
});


router.get("/viewDev",requireLogin,async function(req,res){
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val= await query.fetchAllDev();
  var page_count = Math.ceil(val.length / 3);

  let Devs = val.slice(page * 10 - 10, page * 10);
  console.log(Devs);
  res.render("admin/DevHome", {
    Devs: Devs,
    page_count: page_count,
    cur_page: page,
  });
  
});

router.get("/viewDev/:id/edit", requireLogin,async function (req, res) {
  var val = await query.fetchDev(req.params.id);
  res.render("admin/editDev", {
    updateRequest: false,
    Dev: val,
  });
});

router.put(
  "/viewDev/:id/edit",
  requireLogin,
  upload6.array("image"),
  async function (req, res) {
    var Dev = req.body.Dev;
    let deleteImage = false;
    Dev.description = seperateParagraphs(Dev.description);
    Dev.image = [{ filename: Dev.image }];
    if (req.files.length > 0) {
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      deleteImage = Dev.image[0].filename;
      Dev.image = uploadImages;
    }
    var val = await query.updateDev(req.params.id, Dev);
    res.redirect("../../viewDev/" + req.params.id);
    if (val && deleteImage) {
      fs.unlink("public/Dev/" + deleteImage, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }
);

router.post("/viewDev/:id/sendMAil", requireLogin,async function (req, res) {
  console.log("Send Mail");
  let batchSize=200;
  let cnt =0 ;
  var emailList=[];
  let dev= await query.fetchDev(req.params.id);
  console.log(dev);
  var findSTS = await query.fetchEmailSTS(dev.title);
  console.log("Emailer db");
  console.log(findSTS);

  var valfind = await query.fetchAllEmailers();
  
  var EmailStatus;
  //for loop to attach 200 emailers in bbc
  let x = valfind.length;
  var subject ="KVAR Tech's New Development:"+ dev.title;
  var hyperlink="https://kvartech.in/NewDev/"+req.params.id;
  var imagePath="https://kvartech.in/public/Dev/"+dev.image[0].filename;
  var title ="New Development"
  let tpp=0;
  if(x<200){
      tpp=x;
    }else{
      tpp=200;
    }
  for(let i=0;i<x ;i=i+tpp){
    //batchIndex,batchSize,emailIds
    let tp=0;
    if(x<200){
      tp=x;
    }else{
      tp=200;
    }
    for(let j=0;j<tp;j++){
      emailList.push(valfind[j].Email);
    }
    console.log(emailList);
    let emailIds =  getNextBatch(cnt,batchSize,emailList);
    SendHtmlMail(emailIds,subject,dev.title,imagePath,dev.description[0].substr(0,180),hyperlink,title);
    cnt++;
    emailList.splice(0, 200);
  }
  findSTS.STS=true;
  if(findSTS.STS){
    dev.status="Email Already Send :)";
  }else{
    dev.status="Email not Send :(";
  }
  temp = await query.updateEmailSTS(findSTS);
  res.render("admin/viewDev", {
    updateRequest: false,
    blog: dev,
  });
  
});


router.delete("/viewDev/:id/delete", requireLogin,async function (req, res) {
  var val = await query.deleteDev(req.params.id);
  //res.redirect("../../blogs");
  if (val[0] == true) {
    val[1].image.forEach((image) => {
      console.log("public/Dev/" + image.filename);
      fs.unlink("public/Dev/" + image.filename, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  }
  res.redirect("../../viewDev");
});
//===
//===testimonials
//--Creative Email Sending
function replaceImageTagsWithText(str) {
  // Create a regular expression to match image tags
  var regex = /<img src="/g;

  // Replace each image tag with the specified text
  var replacedStr = str.replace(regex, '<img src="https://kvartech.in'); 

  // Return the modified string
  return replacedStr;
}

router.get("/addCmail",  requireLogin,async function (req, res) {
  let Careers={};
  Careers.status= "";
  res.render("admin/addCmail", {
    insertRequest: false,
    blog: Careers,
  });
});

router.get("/Cmail", requireLogin, function (req, res) {
  fs.readdir(CmailPathImages, function (err, files) {
    //handling error
    let images = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      images.push(file);
    });
    res.render("admin/cmail", {
      images: images,
    });
  });
});




router.delete("/Cmail/:name/delete", requireLogin, function (req, res) {
  fs.unlink("public/EmailImage/" + req.params.name, (err) => {
    if (err) {
      console.error(err);
    }
    res.send("Deleted");
  });
});

router.post("/addCmail", requireLogin,upload9.array("image"),async function(req,res){
  let Careers = req.body.blog;
  console.log(req.body.blog.To);
  console.log(req.body.blog.Subject);

  let emailIds ;
  var emailList=[];
  let batchSize=200;
  let cnt =0 ;
  var HTML;
  var SUB  = req.body.blog.Subject;
  var HTML = '<html><head></head><body>';
  HTML += req.body.editdata;
  HTML+="</body></html>"
  var HTML_CONT = replaceImageTagsWithText(HTML);
  if(req.body.option == 'DataBase'){

    console.log("Database extraction");
    var valfind = await query.fetchAllEmails();
  
    var EmailStatus;
    
    //for loop to attach 200 emailers in bbc
    let x = valfind.length;
    let tpp=0;
    if(x<200){
        tpp=x;
      }else{
        tpp=200;
      }
    for(let i=0;i<x ;i=i+tpp){
      //batchIndex,batchSize,emailIds
      let tp=0;
      if(x<200){
        tp=x;
      }else{
        tp=200;
      }
      for(let j=0;j<tp;j++){
        emailList.push(valfind[j].Email);
      }
      console.log(emailList);
      emailIds =  getNextBatch(cnt,batchSize,emailList);
      SendCustomHtmlMail(emailIds,SUB,HTML_CONT);
      console.log();
      emailList.splice(0, 200);
    }
  }else{
    console.log("cutom");
    var TO   = req.body.blog.To;
    console.log(TO);
    SendCustomHtmlMail(TO,SUB,HTML);
  }
  Careers.status= "Mail Send :)";
  res.render("admin/addCmail", {
    blog: Careers,
  });
  
});

router.post("/upload_image", requireLogin,async function(req,res){
   // Store image
  FroalaEditor.Image.upload(req, '/public/EmailImage/', function(err, data) {
      // Return data.
    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});


//===careers

router.get("/addCareers",  requireLogin, async function (req, res) {
  res.render("admin/addCareers", {
    insertRequest: false,
  });
});

router.post("/addCareers", requireLogin,upload7.array("image"),async function(req,res){
  let Careers = req.body.career;
    //console.log(req.body);
    Careers.description = seperateParagraphs(Careers.description);
    Careers.responsibility = seperateParagraphs(Careers.responsibility);
    Careers.qualification = seperateParagraphs(Careers.qualification);
    Careers.image = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
  //let temp={title:req.body.title,description:req.body.description,image:image};
  id = await query.addCareers(Careers);
  //console.log(req.body);
  res.redirect("viewCareers/" + id);
  //res.send("ok");
});

router.get("/viewCareers/:id", requireLogin,async function(req,res){
  let career= await query.fetchCareers(req.params.id);
  console.log(career);
  res.render("admin/viewcareers", {
    updateRequest: false,
    career: career,
  });
  //res.send(dev);
});

router.get("/viewCareers", requireLogin,async function(req,res){
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val= await query.fetchAllCareers();
  var page_count = Math.ceil(val.length / 3);

  let careers = val.slice(page * 10 - 10, page * 10);
  console.log(careers);
  res.render("admin/careerHome", {
    careers: careers,
    page_count: page_count,
    cur_page: page,
  });
  
});

router.get("/viewCareers/:id/edit", requireLogin,async function (req, res) {
  var val = await query.fetchCareers(req.params.id);
  console.log(val);
  res.render("admin/editcareers", {
    updateRequest: false,
    careers: val,
  });
});

router.put(
  "/viewCareers/:id/edit",
  requireLogin,
  upload7.array("image"),
  async function (req, res) {
    var Careers = req.body.careers;
    let deleteImage = false;
    Careers.description = seperateParagraphs(Careers.description);
    Careers.responsibility = seperateParagraphs(Careers.responsibility);
    Careers.qualification = seperateParagraphs(Careers.qualification);
    Careers.image = [{ filename: Careers.image }];
    if (req.files.length > 0) {
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      deleteImage = Careers.image[0].filename;
      Careers.image = uploadImages;
    }
    var val = await query.updateCareers(req.params.id, Careers);
    res.redirect("../../viewcareers/" + req.params.id);
    if (val && deleteImage) {
      fs.unlink("public/Careers/" + deleteImage, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }
);

router.delete("/viewCareers/:id/delete", requireLogin,async function (req, res) {
  var val = await query.deleteCareers(req.params.id);
  //res.redirect("../../blogs");
  if (val[0] == true) {
    val[1].image.forEach((image) => {
      console.log("public/Careers/" + image.filename);
      fs.unlink("public/Careers/" + image.filename, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  }
  res.redirect("../../viewcareers");
});
//---Emailers DataBase
router.get("/AddEmailerDb", requireLogin, async function (req, res) {
  res.render("admin/addEmailer", {
    type: "Emailers DB",
    link: "/admin/AddEmailerDb",
  });
});

let notes = "";

router.get("/emailer/:name/upload",  async function (req, res) {
  var buf2;
  var dataTwo = [];
  notes = "Adding data to DataBase,Pls Wait :)";
  //console.log(req.params.name);
  res.redirect("/admin/emailer");
  //read csv
  var valfind = await query.fetchAllEmailers();
  console.log("find relay");
  console.log(valfind);
  let bool = false;
  const reader = fs.createReadStream("public/EmailersDb/" + req.params.name);
  reader.pipe(parse({delimiter: ',', from_line: 2 }))
  .on('data', async (row) => {
      console.log("Row data:");
      console.log(row);
        for(let i=0;i<valfind.length;i++){
          
          if(valfind[i].CompanyName == row[0] && valfind[i].Email == row[1] && valfind[i].Contact == row[2] && valfind[i].Subscribe == row[3]){
            bool =true;
            console.log("match found");
            break;
          }else{
            console.log("not match found");
            bool =false;
          }
          
        }
        if(!bool){
          let stock ={CompanyName:row[0],Email:row[1],Contact:row[2],Subscribe:row[3]};
          dataTwo.push(stock); 
        }
        
    
  })

  reader.on("end", async ()=> {
      
      console.log("finished"); 
      
      const jsonString = JSON.stringify(dataTwo);

      // Convert the JSON string back to an object
      const newObj = JSON.parse(jsonString);
      console.log(newObj);

      var val = await query.addEmailers(newObj);
      
      
  })
  
  reader.on("error", function (error) {
      console.log(error.message);
  });
  
});

router.get("/emailer/fetchAll", requireLogin, async function (req, res) {
  console.log("Export CSV");
  var valfind = await query.fetchAllEmailers();
  console.log(valfind);
  const withoutid = valfind.map(({_id, ...rest}) => rest)
  const csv = new objectstocsv(withoutid.reverse());
  var path= "./EmailersDB.csv";
  await csv.toDisk(path);
    
    return res.download(path,() =>{
        fs.unlinkSync(path)
    });
  
});



router.delete("/emailer/:name/delete", requireLogin, function (req, res) {
  console.log(req.params.name);
  fs.unlink("public/EmailersDb/" + req.params.name, (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/admin/emailer");
  });
});

router.post(
  "/AddEmailerDb",
  requireLogin,
  upload8.array("EmailerDb"),
  function (req, res) {
    res.redirect("/admin/emailer");
  }
);

router.get("/emailer", requireLogin, function (req, res) {
  fs.readdir(EmailersDir, function (err, files) {
    //handling error
    let brochures = [];
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      brochures.push(file);
    });
    res.render("admin/emailer", {
      EmailerDb: brochures,
      notes:notes,
    });
    notes=""
  });
});
//---blogs
router.get("/addBlog", requireLogin, async function (req, res) {
  res.render("admin/addBlog", {
    insertRequest: false,
  });
});

router.post(
  "/addBlog",
  requireLogin,
  upload5.array("image"),
  async function (req, res) {
    const DevEmail={};
    let blog = req.body.blog;
    console.log(req.body);
    blog.description = seperateParagraphs(blog.description);
    blog.image = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    let id = await query.addBlog(blog);
    DevEmail.title=blog.title;
    DevEmail.STS=false;
    console.log("EMAIL STS");
    console.log(DevEmail);
    temp = await query.addEmailerSTS(DevEmail); 
    res.redirect("blogs/" + id);
  }
);

router.get("/blogs", requireLogin, async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllBlogs();
  var page_count = Math.ceil(val.length / 3);

  let blogs = val.slice(page * 10 - 10, page * 10);
  console.log(blogs);

  res.render("admin/blogsHome", {
    blogs: blogs,
    page_count: page_count,
    cur_page: page,
  });
});

router.post("/blogs", requireLogin, async function (req, res) {
  var val = await query.searchBlog(req.body.title);
  res.render("admin/blogsHome", {
    blogs: val,
  });
});

router.get("/blogs/:id", requireLogin, async function (req, res) {
  var blog = await query.fetchBlog(req.params.id);
  var findSTS = await query.fetchEmailSTS(blog.title);
  console.log("Emailer db");
  console.log(findSTS);
  if(findSTS.STS){
    blog .status="Email Already Send :)";
  }else{
    blog .status="Email not Send :(";
  }
  res.render("admin/viewBlog", {
    blog: blog,
  });
});

router.get("/blogs/:id/edit", requireLogin, async function (req, res) {
  var val = await query.fetchBlog(req.params.id);
  res.render("admin/editBlog", {
    updateRequest: false,
    blog: val,
  });
});

router.put(
  "/blogs/:id/edit",
  requireLogin,
  upload5.array("images"),
  async function (req, res) {
    var blog = req.body.blog;
    let deleteImage = false;
    blog.description = seperateParagraphs(blog.description);
    blog.image = [{ filename: blog.image }];
    if (req.files.length > 0) {
      uploadImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      deleteImage = blog.image[0].filename;
      blog.image = uploadImages;
    }
    var val = await query.updateBlog(req.params.id, blog);
    res.redirect("../../blogs/" + req.params.id);
    if (val && deleteImage) {
      fs.unlink("public/blogs/" + deleteImage, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }
);

router.post("/blogs/:id/sendMAil", requireLogin,async function (req, res) {
  console.log("Send Mail");
  let batchSize=200;
  let cnt =0 ;
  var emailList=[];
  let dev= await query.fetchBlog(req.params.id);
  console.log(dev);
  var findSTS = await query.fetchEmailSTS(dev.title);
  console.log("Emailer db");
  console.log(findSTS);

  var valfind = await query.fetchAllEmailers();
  
  var EmailStatus;
  //for loop to attach 200 emailers in bbc
  let x = valfind.length;
  var subject ="KVAR Tech's Blogs:"+ dev.title;
  var hyperlink="https://kvartech.in/blogs/"+req.params.id;
  var imagePath="https://kvartech.in/public/blogs/"+dev.image[0].filename;
  console.log(dev.image[0].filename);
  var title ="Blogs"
  let tpp=0;
  if(x<200){
      tpp=x;
    }else{
      tpp=200;
    }
  for(let i=0;i<x ;i=i+tpp){
    //batchIndex,batchSize,emailIds
    let tp=0;
    if(x<200){
      tp=x;
    }else{
      tp=200;
    }
    for(let j=0;j<tp;j++){
      emailList.push(valfind[j].Email);
    }
    console.log(emailList);
    let emailIds =  getNextBatch(cnt,batchSize,emailList);
    SendHtmlMail(emailIds,subject,dev.title,imagePath,dev.description[0].substr(0,180),hyperlink,title);
    cnt++;
    emailList.splice(0, 200);
  }
  findSTS.STS=true;
  if(findSTS.STS){
    dev.status="Email Already Send :)";
  }else{
    dev.status="Email not Send :(";
  }
  temp = await query.updateEmailSTS(findSTS);
  res.render("admin/viewBlog", {
    updateRequest: false, 
    blog: dev,
  });
  
});

router.delete("/blogs/:id/delete", requireLogin, async function (req, res) {
  var val = await query.deleteBlog(req.params.id);
  res.redirect("../../blogs");
  if (val[0] == true) {
    val[1].image.forEach((image) => {
      console.log("public/blogs/" + image.filename);
      fs.unlink("public/blogs/" + image.filename, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  }
});


//---end blops
function getNextBatch(batchIndex,batchSize,emailIds) {
  const startIndex = batchIndex * batchSize;
  const endIndex = startIndex + batchSize;
  const batch = emailIds.slice(startIndex, endIndex);
  return batch;
}

function StringConcat(string1,string2){
    var s = string1;
    s = s + string2;
    return s;
}

async function SendHtmlMail(To,SUB,tittle,Path,Desc,Link,title2){
    var content = fs.readFileSync("index.html","utf-8"); //read the email template of new devlopements file
    const template = Handlebars.compile(content);
    const data = { NewDev: tittle, imagePath:Path,description:Desc,link:Link,title:title2};
    const output = template(data);
    //get mail id only of those who are Subscribe
    var mailOptions2 = {
      from: process.env.KVAR_FROM,
      to: 'sales@kvartech.com',
      subject: SUB,
      bcc: To,
      html: output,
    };
    transporter.sendMail(mailOptions2, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent:");
      }
    });
    
}



async function SendCustomHtmlMail(To,SUB,HTML){
    
    //get mail id only of those who are Subscribe
    var mailOptions5 = {
      from: process.env.KVAR_FROM,
      to: 'sales@kvartech.com',
      subject: SUB,
      bcc: To,
      html: HTML,
    };
    transporter.sendMail(mailOptions5, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent:");
      }
    });
    
}

function convert_to_object(str) {
  var x = str.trim().split(/\n/); //First trim spaces from start and end then split each line
  var j = [];
  x.forEach((element) => {
    // j.push(element.split(/\s{1,}|\t/))     // Split on (one and more spaces) OR (tab) ie split into key-values
    j.push(element.split("="));
  });
  details = {};
  for (var i = 0; i < j.length; i++) {
    details[j[i][0]] = j[i][1]; // Store key-value pair in product details
  }
  return details;
}

function seperateParagraphs(str) {
  var x = str.trim().split("="); //First trim spaces from start and end and split using =

  return x;
}

async function navigation_content() {
  constant.categories = await query.fetchAllCategories();
  let products_fromdb = await query.fetchAllProducts();
  let products_temp = [];
  products_fromdb.forEach((product) => {
    let temp = {
      name: product.name,
      _id: product._id,
      category: product.category,
    };
    products_temp.push(temp);
  });
  constant.products = products_temp;
}

module.exports = router;
