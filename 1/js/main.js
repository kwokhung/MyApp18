define([
    "dojo/_base/lang",
    "dojo/node!util",
    "dojo/node!express.io",
    //"dojo/node!googleapis",
    "dojo/node!passport",
    "dojo/node!passport-oauth",
    "app/util/AppHelper",
    "app/util/ExpressHelper"
], function (lang, util, express, /*googleapis, */passport, passportOauth, AppHelper, ExpressHelper) {
    return function (appDirName) {
        var appHelper = new AppHelper();

        appHelper.initApp();

        var app = express();

        var expressHelper = new ExpressHelper({
            appDirName: appDirName,
            app: app
        });

        /*var oauth2Client = new googleapis.OAuth2Client("307608331908.apps.googleusercontent.com", "k60JRt7LS_Gq864dIAg0wNE5", "http://localhost:3000/auth/token");

        var googleClient = null;

        googleapis
            .discover("plus", "v1")
            .discover("calendar", "v3")
            .discover("oauth2", "v2")
            .execute(function (error, client) {
                if (!error) {
                    googleClient = client;
                }
            });*/

        var OAuth2Strategy = passportOauth.OAuth2Strategy;
        var InternalOAuthError = passportOauth.InternalOAuthError;

        OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
            return done(null, {});
        }

        OAuth2Strategy.prototype.authorizationParams = function (options) {
            var params = {};

            if (options.accessType) {
                params["access_type"] = options.accessType;
            }

            if (options.approvalPrompt) {
                params["approval_prompt"] = options.approvalPrompt;
            }

            return params;
        }

        /*var googleStrategy = new OAuth2Strategy({
            authorizationURL: "https://accounts.google.com/o/oauth2/auth",
            tokenURL: "https://accounts.google.com/o/oauth2/token",
            clientID: "307608331908.apps.googleusercontent.com",
            clientSecret: "k60JRt7LS_Gq864dIAg0wNE5",
            callbackURL: "http://localhost:3000/auth/token"
        }, function (accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            done(null, profile);
        })

        passport.use("provider", googleStrategy);*/

        var myStrategy = new OAuth2Strategy({
            authorizationURL: "http://localhost:3100/dialog/authorize",
            tokenURL: "http://localhost:3100/oauth/token",
            clientID: "abc123",
            clientSecret: "ssh-secret",
            callbackURL: "http://localhost:3000/auth/token"
        }, function (accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            done(null, profile);
        })

        passport.use("provider", myStrategy);

        app.configure(function () {
            app.use(express.logger());
            app.use(express.cookieParser());
            app.use(express.session({
                secret: "something",
                store: new express.session.MemoryStore
            }));
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
            app.use("/www", express.static(appDirName + "/www"));
        });

        app.get("/index.html", lang.hitch(expressHelper, expressHelper.handleIndex));

        app.get("/process", lang.hitch(expressHelper, expressHelper.handleProcess));

        /*app.get("/auth/code", function (req, res) {
            var url = oauth2Client.generateAuthUrl({
                approval_prompt: "force",
                access_type: "offline",
                scope: "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar"
            });

            return res.redirect(url);
        });*/
        /*app.get("/auth/code", passport.authenticate("provider", {
            approvalPrompt: "force",
            accessType: "offline",
            scope: [
                "https://www.googleapis.com/auth/plus.me",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/calendar"
            ]
        }));*/
        app.get("/auth/code", passport.authenticate("provider", {
            //approvalPrompt: "force",
            accessType: "offline",
            scope: [
                "http://localhost:3100/api/userinfo",
                "http://localhost:3100/api/clientinfo"
            ]
        }));

        /*app.get("/auth/token", function (req, res, next) {
            if (req.query.error) {
                res.writeHead(401);
                res.end(util.inspect(req.query.error, false, null));
            }
            else if (!req.query.code) {
                res.writeHead(401);
                res.end(util.inspect("No authorization code supplied", false, null));
            }
            else if (!googleClient) {
                res.writeHead(401);
                res.end(util.inspect("No API client provided", false, null));
            }
            else {
                oauth2Client.getToken(req.query.code, function (error, tokens) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    } else {
                        oauth2Client.credentials = tokens;
                        next();
                    }
                });
            }
        }, function (req, res, next) {
            googleClient
                .plus.people.get({ userId: "me" })
                .withAuthClient(oauth2Client)
                .execute(function (error, people) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    } else {
                        req.session.people = people;
                        next();
                    }
                });
        }, function (req, res, next) {
            googleClient
                .oauth2.userinfo.get()
                .withAuthClient(oauth2Client)
                .execute(function (error, userinfo) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    } else {
                        req.session.userinfo = userinfo;
                        next();
                    }
                });
        }, function (req, res, next) {
            googleClient
                .calendar.calendarList.list()
                .withAuthClient(oauth2Client)
                .execute(function (error, calendarList) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    } else {
                        req.session.calendarList = calendarList;
                        next();
                    }
                });
        }, function (req, res) {
            res.redirect("/auth/ok");
        });*/
        /*app.get("/auth/token", function (req, res, next) {
            if (req.query.error) {
                res.writeHead(401);
                res.end(util.inspect(req.query.error, false, null));
            }
            else if (!req.query.code) {
                res.writeHead(401);
                res.end(util.inspect("No authorization code supplied", false, null));
            }
            else {
                passport.authenticate("provider", function (error, profile, info) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    }
                    else if (!profile) {
                        res.writeHead(401);
                        res.end(util.inspect("Authentication failed", false, null));
                    }
                    else {
                        req.session.profile = profile;
                        next();
                    }
                })(req, res, next);
            }
        }, function (req, res, next) {
            googleStrategy._oauth2.get("https://www.googleapis.com/plus/v1/people/me", req.session.profile.accessToken, function (error, body) {
                if (error) {
                    res.writeHead(401);
                    res.end(util.inspect(error, false, null));
                }
                else {
                    req.session.people = JSON.parse(body);
                    next();
                }
            });
        }, function (req, res, next) {
            googleStrategy._oauth2.get("https://www.googleapis.com/oauth2/v2/userinfo", req.session.profile.accessToken, function (error, body) {
                if (error) {
                    res.writeHead(401);
                    res.end(util.inspect(error, false, null));
                }
                else {
                    req.session.userinfo = JSON.parse(body);
                    next();
                }
            });
        }, function (req, res, next) {
            googleStrategy._oauth2.get("https://www.googleapis.com/calendar/v3/users/me/calendarList", req.session.profile.accessToken, function (error, body) {
                if (error) {
                    res.writeHead(401);
                    res.end(util.inspect(error, false, null));
                }
                else {
                    req.session.calendarList = JSON.parse(body);
                    next();
                }
            });
        }, function (req, res) {
            res.redirect("/auth/ok");
        });*/
        app.get("/auth/token", function (req, res, next) {
            if (req.query.error) {
                res.writeHead(401);
                res.end(util.inspect(req.query.error, false, null));
            }
            else if (!req.query.code) {
                res.writeHead(401);
                res.end(util.inspect("No authorization code supplied", false, null));
            }
            else {
                passport.authenticate("provider", function (error, profile, info) {
                    if (error) {
                        res.writeHead(401);
                        res.end(util.inspect(error, false, null));
                    }
                    else if (!profile) {
                        res.writeHead(401);
                        res.end(util.inspect("Authentication failed", false, null));
                    }
                    else {
                        req.session.profile = profile;
                        next();
                    }
                })(req, res, next);
            }
        }, function (req, res, next) {
            myStrategy._oauth2.get("http://localhost:3100/api/userinfo", req.session.profile.accessToken, function (error, body) {
                if (error) {
                    res.writeHead(401);
                    res.end(util.inspect(error, false, null));
                }
                else {
                    req.session.userinfo = JSON.parse(body);
                    next();
                }
            });
        }, function (req, res) {
            res.redirect("/auth/ok");
        });

        /*app.get("/auth/ok", function (req, res) {
            res.writeHead(200);
            res.end(util.inspect(req.session.people, false, null) + "\n" + util.inspect(req.session.userinfo, false, null) + "\n" + util.inspect(req.session.calendarList, false, null));
        });*/
        app.get("/auth/ok", function (req, res) {
            res.writeHead(200);
            res.end(util.inspect(req.session.userinfo, false, null));
        });

        app.listen(process.env.PORT || 3000);
        console.log("Listening on port " + (process.env.PORT || 3000));
    };
});