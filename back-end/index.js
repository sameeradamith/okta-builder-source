const express = require('express');
var cors = require('cors');
const app = express()
app.use(cors())
const port = process.env.PORT || 3000

const replace = require('replace-in-file');
const bodyParser = require('body-parser');
var randomstring = require("randomstring");
const fse = require('fs-extra')
const sqlite3 = require('sqlite3').verbose();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const del = require('del');

const zl = require("zip-lib");
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: "",
  issuer: ""
});


function authenticationRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    res.status(401);
    return next('Unauthorized');
  }

  const accessToken = match[1];
  return oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default')
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}


app.get('/', (req, res) => {
  res.send('Hello World!')
})

let db = new sqlite3.Database('./db/build.db');

db.run('CREATE TABLE IF NOT EXISTS builds(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, app_type TEXT, app_name TEXT, build_id TEXT)');

// Update project file values
// 1. update app_name
// 2. update config values
app.post('/app/update', authenticationRequired, (req, res) => {

  const app_id = randomstring.generate(12);

  //
  // Redirected app
  //
  if(req.body.auth_method == 'redirect') {

  // Redirected app
  // Create a temp project
  fse.copy('./demo_applications/redirect-app', './temp/' + app_id, err => {
    if (err) return console.error(err)

        // Update app name
        if(req.body.app_name != undefined && req.body.app_name != "") {
          const app_name_options = {
            files: ['./temp/'+ app_id +'/package.json',
            './temp/'+ app_id +'/angular.json',
            './temp/'+ app_id +'/karma.conf.js',
            './temp/'+ app_id +'/package-lock.json',
            './temp/'+ app_id +'/src/index.html'],
            from: /redirect-app/g,
            to: req.body.app_name,
          };
        
          replace(app_name_options)
          .then(results => {

              // Update issuer_value (environment file)
              const environment_issuer_option = {
                files: ['./temp/'+ app_id +'/src/environments/environment.ts',
                './temp/'+ app_id +'/src/environments/environment.prod.ts'],
                from: 'issuer_value',
                to: req.body.issuer_value,
              };
              replace(environment_issuer_option)
              .then(results => {

                // Update clientId_value (environment file)
                const environment_clientId_value = {
                  files: ['./temp/'+ app_id +'/src/environments/environment.ts',
                  './temp/'+ app_id +'/src/environments/environment.prod.ts'],
                  from: 'clientId_value',
                  to: req.body.clientId_value,
                };
                replace(environment_clientId_value)
                .then(results => {

                      // Update redirectUri_value (environment file)
                      const environment_redirectUri_value = {
                        files: ['./temp/'+ app_id +'/src/environments/environment.ts',
                        './temp/'+ app_id +'/src/environments/environment.prod.ts'],
                        from: 'redirectUri_value',
                        to: req.body.redirectUri_value,
                      };
                      replace(environment_redirectUri_value)
                      .then(results => {

                          // Create a ZIP file
                          // create a file to stream archive data to.
                          zl.archiveFolder("./temp/" + app_id, "./temp/" + app_id + ".zip").then(function () {
                          }, function (err) {
                              console.log(err);
                          });

                          // Update database
                            db.run('INSERT INTO builds(user_id, app_name, app_type, build_id) VALUES(?,?,?,?);', [req.body.user_id, req.body.app_name, req.body.auth_method, app_id], function(err) {
                              if (err) {
                                console.log(err);
                              }

                              res.status(200).send(
                                {
                                  "success": true,
                                  "resposne": {"build_app_id" : app_id},
                                }
                              )

                            });

                      })
                      .catch(error => {
                        res.status(500).send(
                          {
                            "success": false,
                            "resposne": "Project create not successfully.",
                          }
                        )
                      });

                })
                .catch(error => {
                  res.status(500).send(
                    {
                      "success": false,
                      "resposne": "clientId_value update not successfully.",
                    }
                  )
                });

              })
              .catch(error => {
                res.status(500).send(
                  {
                    "success": false,
                    "resposne": "issuer_value update not successfully.",
                  }
                )
              });

              
          })
        
          .catch(error => {
            res.status(500).send(
              {
                "success": false,
                "resposne": "Files update not successfully.",
              }
            )
          });
        }

  })
  } else if(req.body.auth_method == 'embedded') {


  //
  // Embedded app
  //
  // Create a temp project
  fse.copy('./demo_applications/embedded-sign-in-widget', './temp/' + app_id, err => {
    if (err) return console.error(err)

        // Update app name
        if(req.body.app_name != undefined && req.body.app_name != "") {

              // Update issuer_value (environment file)
              const environment_issuer_option = {
                files: ['./temp/'+ app_id +'/testenv'],
                from: 'issuer_value',
                to: req.body.issuer_value,
              };
              replace(environment_issuer_option)
              .then(results => {

                // Update clientId_value (environment file)
                const environment_clientId_value = {
                  files: ['./temp/'+ app_id +'/testenv'],
                  from: 'clientId_value',
                  to: req.body.clientId_value,
                };
                replace(environment_clientId_value)
                .then(results => {

                      // Update client_secret
                      const environment_client_secret = {
                        files: ['./temp/'+ app_id +'/testenv'],
                        from: 'client_secret',
                        to: req.body.client_secret,
                      };
                      replace(environment_client_secret)
                      .then(results => {

                          // Update redirect_url
                          const environment_redirect_url = {
                            files: ['./temp/'+ app_id +'/config.js'],
                            from: 'redirectUri_value',
                            to: req.body.redirectUri_value,
                          };
                          replace(environment_redirect_url)
                          .then(results => {

                                      // Create a ZIP file
                                      // create a file to stream archive data to.
                                      zl.archiveFolder("./temp/" + app_id, "./temp/" + app_id + ".zip").then(function () {
                                          console.log("done");
                                      }, function (err) {
                                          console.log(err);
                                      });


                                    // Update database
                                      db.run('INSERT INTO builds(user_id, app_name, app_type, build_id) VALUES(?,?,?,?);', [req.body.user_id, req.body.app_name, req.body.auth_method, app_id], function(err) {
                                        if (err) {
                                          console.log(err);
                                        }
                                        console.log("New build has been added");

                                        res.status(200).send(
                                          {
                                            "success": true,
                                            "resposne": {"build_app_id" : app_id},
                                          }
                                        )

                                      });


                          })
                          .catch(error => {
                            res.status(500).send(
                              {
                                "success": false,
                                "resposne": "Project create not successfully.",
                              }
                            )
                          });
                          

                      })
                      .catch(error => {
                        res.status(500).send(
                          {
                            "success": false,
                            "resposne": "Project create not successfully.",
                          }
                        )
                      });

                })
                .catch(error => {
                  res.status(500).send(
                    {
                      "success": false,
                      "resposne": "clientId_value update not successfully.",
                    }
                  )
                });

              })
        
          .catch(error => {
            res.status(500).send(
              {
                "success": false,
                "resposne": "Files update not successfully.",
              }
            )
          });
        }

  })

  }
  
})


// Get all lists
app.get('/app/list', authenticationRequired, (req, res) => {

  db.serialize(() => {
    db.all('SELECT * FROM builds;' , [], function(err,rows) {     
      if(err) {
        console.error(err.message);
      }
      res.json(rows);
    });

  });
});


// Get build to user_id
app.get('/build/:user_id', authenticationRequired, (req, res) => {

  db.serialize(() => {
    db.all('SELECT * FROM builds WHERE user_id = ?' , [req.params.user_id], function(err,rows) {     
      if(err) {
        console.error(err.message);
      }
      res.json(rows);
    });

  });
});

// Delete
app.get('/delete/:build_id', authenticationRequired, (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM builds WHERE build_id = ?', [req.params.build_id], function(err) {
      if (err) {
        res.send({
          "success": false
        });
      }

      // TODO : Delete files
      (async() => {
        await del(["./temp/" + req.params.build_id, "./temp/" + req.params.build_id + ".zip"]);
      })()

      res.send({
        "success": true
      });
    });

  });
});

// Download single file
app.get('/download/:type/:id', (req, res) => {
  res.setHeader('Content-type','application/zip');
  res.sendFile(__dirname + '/temp/'+ req.params.id +'.zip');
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})