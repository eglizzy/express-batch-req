const express = require('express')

function Socket() {
}
Socket.prototype.destroy = function () {
}

/**
 * @class Request
 * @description mock request class to pipe through express
 */
function Request() {
  this.socket = new Socket()
  this.headers = {}
}

/**
 * @class Response
 * @description mock response class to pipe through express
 */

function Response() {
}

Request.prototype = express.request // add on the additional express tools each request inherits
Response.prototype = express.response // add on the additional express tools each response inherits

function BatchRequest(path, method) {
  this.request = new Request()
  this.response = new Response()

  /**
   * @memberOf Response
   * @description Mocks the send functionality, and executes the registered callback
   */

  this.response.send = function (code, response) {

    if (typeof code !== 'integer' && response === undefined) {
      response = code
    }
    this.callback(code, response, this)
  }

  this.response.json = function (res) {
    this.send(res)
  }

  /**
   *  Mocks the end functionality, executes the registered callback with end msg
   */
  this.response.end = function (msg) {
    this.callback(msg)
  }

  this.response.setCallback = function (cb) {
    this.callback = cb
  }

  /**
   * Pass through functionality for the express set method

   * @param {string} h header key
   * @param {string} v header value
   */
  this.response.setHeaders = function (h, v) {
    this.set(h, v)
  }

  this.response.setHeader = function (name, value) {
    this.set(name, value)
  }

  this.request.method = method
  this.request.url = path
  this.path = path
  this.method = method
  this.response.method = method
  // this.route = router.match(method, path)
}

/**
 * Attaches body object to the request.
 */
BatchRequest.prototype.addBody = function (body) {
  this.request.body = body || {}
  return this
}

/**
 * Add files to the request, still needs work
 *
 */
BatchRequest.prototype.addFiles = function (files) {
  this.request.files = files
  return this
}

/**
 * Add headers to the request, still needs work
 */
BatchRequest.prototype.addHeaders = function (headers = []) {
  headers.forEach(h => this.request.setHeader(h.name, h.value))
  return this
}

/**
 * Calls the express handler for the route.
 */
BatchRequest.prototype.execute = function (app, cb) {
  this.response.setCallback(cb)
  app.handle(this.request, this.response)
}

/**
 * @description Generates and returns a new instance of {BatchRequest}
 */
const batchReq = batch => {
  return new BatchRequest(batch.path, batch.method)
    .addBody(batch.body)
    .addHeaders(batch.headers)
}

module.exports = batchReq