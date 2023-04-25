var express = require("express");
bodyParser = require("body-parser");
methodOverride = require("method-override");
expressSession = require("express-session");
adminRoutes = require("./routes/admin");
app = express();
query = require("./DBqueries");
constant = require("./constant");
nodemailer = require("nodemailer");
transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.KVAR_FROM,
    pass: process.env.PASS,
  },
});
directoryPath = path.join(__dirname, "./public/brochures");
galleryPathImages = path.join(__dirname, "./public/gallery/imgs");
galleryPathVideos = path.join(__dirname, "./public/gallery/vids");
//captcha = require("./captcha");
dotenv = require("dotenv");
moment = require("moment");
metas = require("./meta");

const questions = [
  { q: "What is India's national animal ?", a: "tiger" },
  { q: "What is India's national sport ?", a: "hockey" },
  { q: "What is India's year of Independence ?", a: "1947" },
  { q: "What is the top color of India's Flag ?", a: "Saffron" },
  { q: "What is the bottom color of India's Flag ?", a: "Green" },
  { q: "What is the middle color of India's Flag ?", a: "white" },
  {
    q: "What is the number of stripes on Ashoka chakra present on Indian flag ?",
    a: "24",
  },
  { q: "What is the number of hours in a day ?", a: "24" },
  { q: "What is the number of minutes in an hour", a: "60" },
  { q: "What is 2 + 2 = ?", a: "4" },
];

dotenv.config();

app.set("views", "./views");

app.use("/public/", express.static(__dirname + "/public"));

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  expressSession({ secret: "secret", resave: false, saveUninitialized: true })
);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
const RECAPTCHA_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

app.get("/", async function (req, res) {
  var bseller = await query.fetchBSellers();
  console.log(constant.categories, constant.products);
  var categories = await query.fetchAllCategories();
  res.render("index", {
    meta: metas.metas.home,
    nav_products: constant.products,
    nav_categories: constant.categories,
    categories: categories,
    bseller: bseller,
    length: constant.categories.length,
    nav: 1,
  });
});

app.get("/category/:id", async function (req, res) {
  var category = await query.fetchCategory(req.params.id);
  var products = await query.fetchCategoryProducts(category.name);
  metas.metas.category.title_content = category.name;
  metas.metas.category.description = category.description;
  res.render("category", {
    meta: metas.metas.category,
    nav_products: constant.products,
    nav_categories: constant.categories,
    category: category,
    products: products,
    nav: 3,
  });
});

app.get("/products/:id", async function (req, res) {
  var product = await query.fetchProduct(req.params.id);
  metas.metas.product.title_content = product.name;
  metas.metas.product.description = product.description;
  res.render("product", {
    meta: metas.metas.product,
    nav_products: constant.products,
    nav_categories: constant.categories,
    product: product,
    nav: 3,
  });
});

app.post("/products/:id", async function (req, res) {
  console.log(req.body);
});

app.get("/contact", function (req, res) {
  /*const { image, text } = captcha(150, 80);*/
  let rand = randomNumber(0, 9);
  res.render("contact", {
    meta: metas.metas.contact,
    nav_products: constant.products,
    nav_categories: constant.categories,
    /*captcha_image:image,
        captcha_text:text*/
    nav: 4,
    question: questions[rand].q,
    questionIndex: rand,
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    meta: metas.metas.about,
    nav_products: constant.products,
    nav_categories: constant.categories,
    nav: 2,
  });
});

app.get("/presentation", function (req, res) {
  res.render("presentation", {
    meta: metas.metas.presentation,
    nav_products: constant.products,
    nav_categories: constant.categories,
    nav: 1,
  });
});

/*app.get("/blogs", function (req, res) {
  res.render("blogs", {
    nav_products: constant.products,
    nav_categories: constant.categories,
    nav: 5,
  });
});*/

app.get("/galleryImages", function (req, res) {
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
    res.render("galleryImages", {
      meta: metas.metas.gallery,
      nav_products: constant.products,
      nav_categories: constant.categories,
      images: images,
      nav: 1,
    });
  });
});

app.get("/brochures", function (req, res) {
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
    res.render("brochures", {
      meta: metas.metas.brochure,
      nav_products: constant.products,
      nav_categories: constant.categories,
      brochures: brochures,
      nav: 1,
    });
  });
});

app.get("/authBrouchure/:id", async function (req, res) {
  console.log("GET");
  console.log(req.params.id);
  res.render("authbro.pug", {

  });
});



app.get("/readbrochures/:brochure", function (req, res) {
  res.render("viewBrochure.pug", {
    brochure: req.params.brochure,
    nav: 1,
  });
});

app.post("/verifyCaptcha", async function (req, res) {
  if (req.body.captcha_text == req.body.captcha_actual) res.sendStatus(200);
  else {
    res.statusMessage = "Incorrect captcha! Please try again";
    res.status(400).end();
  }
});

app.get("/NewDev",async function(req,res){
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllDev();
  var page_count = Math.ceil(val.length / 6);

  let Dev = val.slice(page * 6 - 6, page * 6);
  let recentPosts = val.slice(0, 5);
  for (let i = 0; i < Dev.length; i++) {
    let timestamp = Dev[i]._id.getTimestamp();
    Dev[i].date = moment(timestamp).format("DD-MM-YY");
  }
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }
  console.log(Dev);
  res.render("NewDev", {
    meta: metas.metas.NewDevs,
    nav_products: constant.products,
    nav_categories: constant.categories,
    Devs: Dev,
    page_count: page_count,
    cur_page: page,
    recentPosts: recentPosts,
  });
});

app.get("/NewDev/:id", async function (req, res) {
  let Dev = await query.fetchDev(req.params.id);
  let timestamp = Dev._id.getTimestamp();
  Dev.date = moment(timestamp).format("DD-MM-YY");

  var val1 = await query.fetchAllDev();
  let recentPosts = val1.slice(0, 5);
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }
  metas.metas.NewDev.title_content = Dev.name;
  metas.metas.NewDev.description = Dev.description[0];
  res.render("NewDevMain", {
    meta: metas.metas.NewDev,
    nav_products: constant.products,
    nav_categories: constant.categories,
    Dev: Dev,
    recentPosts: recentPosts,
  });
});

app.get("/Careers", async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllCareers();
  var page_count = Math.ceil(val.length / 5);

  let careers = val.slice(page * 5 - 5, page * 5);
  let recentPosts = val.slice(0, 5);
  for (let i = 0; i < careers.length; i++) {
    let timestamp = careers[i]._id.getTimestamp();
    careers[i].date = moment(timestamp).format("DD-MM-YY");
  }
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }

  res.render("Careers", {
    meta: metas.metas.Careers,
    nav_products: constant.products,
    nav_categories: constant.categories,
    careers: careers,
    page_count: page_count,
    cur_page: page,
  });
});

app.get("/Careers/:id", async function (req, res) {
  let rand = randomNumber(0, 9);
  let career = await query.fetchCareers(req.params.id);
  let timestamp = career._id.getTimestamp();
  career.date = moment(timestamp).format("DD-MM-YY");
  console.log("Data");
  console.log(career);
  var val1 = await query.fetchAllCareers();
  let recentPosts = val1.slice(0, 5);
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }
  metas.metas.Career.title_content = career.name;
  metas.metas.Career.description = career.description[0];
  res.render("Career", {
    meta: metas.metas.Career,
    nav_products: constant.products,
    nav_categories: constant.categories,
    career: career,
    recentPosts: recentPosts,
    nav: 4,
    question: questions[rand].q,
    questionIndex: rand,
  });
});

app.get("/blogs", async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var val = await query.fetchAllBlogs();
  var page_count = Math.ceil(val.length / 3);

  let blogs = val.slice(page * 3 - 3, page * 3);
  let recentPosts = val.slice(0, 5);
  for (let i = 0; i < blogs.length; i++) {
    let timestamp = blogs[i]._id.getTimestamp();
    blogs[i].date = moment(timestamp).format("DD-MM-YY");
  }
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }

  res.render("blogsHome", {
    meta: metas.metas.blogs,
    nav_products: constant.products,
    nav_categories: constant.categories,
    blogs: blogs,
    page_count: page_count,
    cur_page: page,
    recentPosts: recentPosts,
  });
});

app.post("/blogs", async function (req, res) {
  var blogs = await query.searchBlog(req.body.title);
  var val1 = await query.fetchAllBlogs();
  let recentPosts = val1.slice(0, 5);
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }
  for (let i = 0; i < blogs.length; i++) {
    let timestamp = blogs[i]._id.getTimestamp();
    blogs[i].date = moment(timestamp).format("DD-MM-YY");
  }
  console.log("Hello");
  res.render("blogsHome", {
    nav_products: constant.products,
    nav_categories: constant.categories,
    blogs: blogs,
    page_count: 1,
    cur_page: 1,
    recentPosts: recentPosts,
  });
});

app.get("/blogs/:id", async function (req, res) {
  let blog = await query.fetchBlog(req.params.id);
  let timestamp = blog._id.getTimestamp();
  blog.date = moment(timestamp).format("DD-MM-YY");

  var val1 = await query.fetchAllBlogs();
  let recentPosts = val1.slice(0, 5);
  for (let i = 0; i < recentPosts.length; i++) {
    let timestamp = recentPosts[i]._id.getTimestamp();
    recentPosts[i].date = moment(timestamp).format("DD-MM-YY");
  }
  metas.metas.blog.title_content = blog.name;
  metas.metas.blog.description = blog.description[0];
  res.render("blog", {
    meta: metas.metas.blog,
    nav_products: constant.products,
    nav_categories: constant.categories,
    blog: blog,
    recentPosts: recentPosts,
  });
}); 

app.post("/sendEmail", async function (request, response) {
  //console.log("request received")
  var answer = request.body.answer;
  var index = request.body.questionIndex;
  if (questions[index].a.toLowerCase() == answer.toLowerCase()) {
    var mailOptions = {
      from: process.env.KVAR_FROM,
      to: process.env.KVAR_TO,
      subject: request.body.subject,
      text:
        "Client Name: " +
        request.body.name +
        "\n\n" +
        "Client Email: " +
        request.body.email +
        "\n\n" +
        "Message: " +
        request.body.message,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    response.status(200).send("OK");
  } else {
    response.statusMessage = "Incorrect answer";
    response.status(400).end();
  }
});

app.post("/sendEmail2", async function (request, response) {
  console.log("request received")
  var answer = request.body.answer;
  var index = request.body.questionIndex;
  const file = request.file;
  var resume = request.body.resume;
  if (questions[index].a.toLowerCase() == answer.toLowerCase()) {
    var mailOptions = {
      from: process.env.KVAR_FROM,
      to: process.env.KVAR_TO,
      subject: request.body.subject,
      
      text:
        "Job Seeker's Name: " +
        request.body.name +
        "\n\n" +
        "Job Seeker's Email: " +
        request.body.email +
        "\n\n" +
        "Job Seeker's message: " +
        request.body.message,
      attachments: [  
        {   
            filename: file.originalname,
            content: request.file.buffer,
            contentType: request.file.mimetype ,  
        }   
        ] 
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    response.status(200).send("Email Send. We will contact u soon :)");
  } else {
    response.statusMessage = "Incorrect answer";
    response.status(400).end();
  }
});

app.post("/sendEmail3", async function (request, response) {
    var mailOptions = {
      from: process.env.KVAR_FROM,
      to: process.env.KVAR_TO,
      subject: 'Subscribed to New Development',
      text:
        "Name: " +
        request.body.name +
        "\n\n" +
        "Email: " +
        request.body.email +
        "\n\n" +
        "PhoneNo: " +
        request.body.phoneNo +
        "\n\n" +
        "Company Name: " +
        request.body.CompanyName,

    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    response.status(200).send("Email Send. We will contact u soon :)");
    var mailOptions2 = {
      from: process.env.KVAR_FROM,
      to: request.body.email,
      subject: 'Thanks for Subscribing to KVAR New Development',
      text: 'Thanks for Subscribing to KVAR New Development. For more updates Stay tuned :)'
    };
    transporter.sendMail(mailOptions2, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    response.status(200).send("Email Send. We will contact u soon :)");
  
});

app.get("*", function (req, res) {
  res.render("404");
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`App is started`);
});

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
