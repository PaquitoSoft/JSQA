Javascript quality analysis tool
================================

This is a simple tool which uses [JsHint](http://www.jshint.com/) to analyze your Javascript code. 
You need to configure your JS base path and the rules you want to apply.
When you run this tool it analyze all the files in your base path (recursively) and then it keeps watching 
for changes in any of them so a new analysis is fired if you edit your code.

A web server is started (by default at port 3000) to let you view a clean and simple analysis report.

![Screenshot](https://github.com/PaquitoSoft/JSQA/raw/master/sample_image.png)


TODO
====

Use [Socket.io](http://socket.io/) library to push changes from the server to the client so they don't have to refresh the web page 
to see new analisys results.