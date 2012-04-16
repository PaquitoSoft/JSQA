Javascript quality analysis tool
================================

This is a simple tool which uses [JsHint](http://www.jshint.com/) to analyze your Javascript code. 
You need to configure your JS base path and the rules you want to apply.
When you run this tool it analyze all the files in your base path (recursively) and then it keeps watching 
for changes in any of them so a new analysis is fired if you edit your code.

A web server is started (by default at port 3000) to let you view a clean and simple analysis report.

![Screenshot](https://github.com/PaquitoSoft/JSQA/raw/master/sample_image.png)

It also uses the outstanding [Socket.io](http://socket.io/) library to push changes from the server to the client so they don't have to refresh the web page 
to see new analisys results.

How to use
==========

Prerequisites: This tools is written using [NodeJs](http://nodejs.org/) so you'll need it installed into your system. 
Also, you should install [npm](http://npmjs.org/).

First you have to clone this repo

```bash
$> git clone git://github.com/PaquitoSoft/JSQA.git
```

Get into de the directory and install tool dependencies

```bash
$> cd JSQA
$> npm install -d
```

Now that yo have the tool ready, configure it for your project. This involves updating two files:

- lib/config.js -> Here you set your project js folder and your exclusions (optional)
- lib/rules.js -> These are the options passed to JSHINT for analysis.

That's it. Now you only need to run the application:


```bash
$> node app.js
```

Web server starts listening on port 5000 by default, so open up a browser and point it to [http://locahost:5000](http://localhost:5000)


TODO
====

- Use the same instance application to analyze several projects
- Save a history of the projects analysis.
