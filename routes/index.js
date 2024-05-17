var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('profile', {user});
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
});


router.get('/feed', async function(req, res, next) {
  try {
    const posts = await postModel.find().populate('user');
    res.render('feed', { posts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al cargar el feed");
  }
});



router.post('/uploadprofile', isLoggedIn, upload.single("file"), async function(req, res, next) {
  try {
    if (!req.file) {
      return res.status(404).send("No se han proporcionado archivos");
    }

    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    // Actualiza el campo profileImage del usuario con la URL de la foto de perfil subida
    user.profileImage = req.file.filename; // Suponiendo que req.file.filename contiene el nombre del archivo de la foto de perfil
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al subir la foto de perfil");
  }
});

router.post('/upload', isLoggedIn, upload.single("file"),async function(req, res, next) {
  if(!req.file){
    return res.status(404).send("no files were given");
  }
  const user = await userModel.findOne({username: req.session.passport.user});
   const post =  await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/register', function(req, res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password)
  .then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    })
  })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){
});

router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
