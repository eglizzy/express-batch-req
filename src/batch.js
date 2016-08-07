const async = require('async')
const batchReq = require('./batchReq')

module.exports = app => (req, res) => {
  const {requests} = req.body
  res.setHeader('Content-Type', 'application/json')

  async.map(
    requests,
    (batch, cb) =>
      batchReq(batch).execute(app, (code, result, response) =>
        cb(false, {statusCode: response.statusCode, body: result})),
    (err, results) => res.json(results)
  )
}