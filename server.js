
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const OAuth2Data = require("./client_secret.json");
var name,pic,data=[]

const { google } = require("googleapis");
const { datastore } = require("googleapis/build/src/apis/datastore");

const app = express();


const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
var authed = false;

// If modifying these scopes, delete token.json.
const SCOPES =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.metadata.readonly";

app.set("view engine", "ejs");

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count
// const upload = multer({ dest: 'uploads/' })
app.get("/", (req, res) => {

  let data2=[];

  if (!authed) {
    // Generate an OAuth URL and redirect there
    var url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log(url);
    res.render("index", { url: url });
  } else {
    var oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    oauth2.userinfo.get(function (err, response) {
      if (err) {
        console.log(err);


      } else {

        const drive = google.drive({version: 'v3', auth:oAuth2Client });
  
        drive.files.list({
          pageSize: 10,
          fields: 'nextPageToken, files(id, name)',
        }, async (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const files = res.data.files;
          if (files.length) {
            console.log('Files:');
            data2=await files
            
            
          
          
          } else {
            console.log('No files found.');
          }
        });


        console.log(response.data);
        name = response.data.name
        pic = response.data.picture
        res.render("success", {
          name: response.data.name,
          pic: response.data.picture,
          success:false,
         
        });
      }
    });



    // const drive = google.drive({version: 'v3', auth:oAuth2Client });
   




  }
});

app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
        console.log("heloloooooooooooooooooooooooooooooooooooo")
      console.log(err);
      return res.end("Something went wrong");
    } else {
      console.log(req.file.path);
      const drive = google.drive({ version: "v3",auth:oAuth2Client  });
      const fileMetadata = {
        name: req.file.filename,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            fs.unlinkSync(req.file.path)
            res.render("success",{name:name,pic:pic,success:true})
          }

        }
      );
    }
  });
});

app.get('/logout',(req,res) => {
    authed = false
    res.redirect('/')
})

app.get("/oauth", function (req, res) {
  const code = req.query.code;
  if (code) {
    // Get an access token based on our OAuth code
    oAuth2Client.getToken(code, function (err, tokens) {
      if (err) {
        console.log("Error authenticating");
        console.log(err);
      } else {
        console.log("Successfully authenticated");
        console.log(tokens)
        oAuth2Client.setCredentials(tokens);


        authed = true;
        res.redirect("/");
      }
    });
  }
});

app.get("/all", (req, ress) => {
  const drive = google.drive({version: 'v3', auth:oAuth2Client });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    console.log(files)
    ress.render("list", {
      success:false,
      data:files
    });
  //   if (files.length) {
  //     console.log('Files:');
  //     data=files

    
    
  
  //   } else {
  //     console.log('No files found.');
  //   }
  });
          
});

app.listen(8082, () => {
  console.log("App is listening on Port 5000");
});