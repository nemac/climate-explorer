#!/usr/bin/env node
const url = require('url');
const nodeStatic = require('node-static');
const http = require('http');


let port = 8082;

let fileServer = new nodeStatic.Server( './dist', {headers: {"cache-control": "no-cache, must-revalidate", "Access-Control-Allow-Origin": "*",  "Access-Control-Allow-Methods": "GET",  "Access-Control-Allow-Headers": "Content-Type"}});


http.createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  }).resume();
}).listen(port);


console.log(`Serving at  http://localhost:${port}/`);
