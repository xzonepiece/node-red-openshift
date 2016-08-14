#!/bin/env node
//  OpenShift sample Node application
var http = require('http');
var express = require("express");
var RED = require("node-red");
var atob = require('atob');

var MyRed = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8000;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }



        // Create the settings object
        self.redSettings = {
            httpAdminRoot:"/",
            httpNodeRoot: "/api",
            userDir: process.env.OPENSHIFT_DATA_DIR,
        };

        if (typeof self.redSettings.userDir === "undefined") {
            console.warn('No OPENSHIFT_DATA_DIR var, using ./');
            self.redSettings.userDir = "./";
        }
    };

     /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating app ...',
                       Date(Date.now()), sig);
            RED.stop();
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();

        // Create an Express app
        self.app = express();

        // Create a server
        self.server = http.createServer(self.app);

        //setup basic authentication
        var basicAuth = require('basic-auth-connect');
        self.app.use(basicAuth(function(user, pass) {
            // 在这里填入用户名和用户密码，用户密码是经过base64加密后的
            return user === 'username' && pass === atob('userpassword');
        }));

        // Initialise the runtime with a server and settings
        RED.init(self.server, self.redSettings);
        console.log('%s is the userDir for RED', self.redSettings.userDir);

        // Serve the editor UI from /red
        self.app.use(self.redSettings.httpAdminRoot,RED.httpAdmin);

        // Serve the http nodes UI from /api
        self.app.use(self.redSettings.httpNodeRoot,RED.httpNode);

        // Add a simple route for static content served from 'public'
        //self.app.use("/",express.static("public"));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.server.listen(self.port,self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });

        // Start the runtime
        RED.start();
    };
};

/**
 *  main():  Main code.
 */
var red = new MyRed();
red.initialize();
red.start();

