const express = require('express')
const router = express.Router()
const pubController = require('./controllers/pubs')
const userController = require('./controllers/user')
const emailController = require('./controllers/email')
const secureRoute = require('./middleware/secureRoute')


router.route('/pub')
  .get(pubController.getPub)
  .post(secureRoute, pubController.addPub)

router.route('/pub/:pubId')
  .get(pubController.singlePub)
  .delete(secureRoute, pubController.removePub)
  .put(secureRoute, pubController.updatePub)

router.route('/register')
  .post(userController.createUser)

router.route('/login')
  .post(userController.loginUser)

router.route('/users')
  .get(userController.findUsers)

router.route('/users/:userId')
  .get(userController.findUser)
  .delete(secureRoute, userController.deleteUser)
  .put(secureRoute, userController.editUser)
  .post(secureRoute, userController.sendRequest)

router.route('/users/:userId/requests')
  .get(userController.getRequest)

router.route('/users/:userId/requests/:requestId')
  .post(secureRoute, userController.acceptRequest)

router.route('/pub/:pubId/subscribers')
  .post(secureRoute, pubController.addSubscribers)
  .get(pubController.findSubscribers)

router.route('/pub/:pubId/comments')
  .post(secureRoute, pubController.createComment)

router.route('/pub/:pubId/comments/:commentId')
  .get(pubController.findComment)
  .put(secureRoute, pubController.updateComment)
  .delete(secureRoute, pubController.deleteComment)

router.route('/pubs/:pubId/comments/:commentId')
  .put(secureRoute, pubController.updateCComment)

router.route('/pub/:pubId/comments/:commentId/new-reply')
  .post(secureRoute, pubController.replyToComment)

router.route('/pub/:pubId/comments/:commentId/reply/:replyId')
  .get(pubController.findReply)
  .put(secureRoute, pubController.updateReply)
  .delete(secureRoute, pubController.deleteReply)


router.route('/pubs/flagged/comments/pubs')
  .get(pubController.getFlaggedCommentsPubs)

router.route('/pubs/flagged/replies/pubs')
  .get(pubController.getFlaggedRepliesPubs)


router.route('/email/ver/:userId')
  .get(emailController.sendVer)

router.route('/email/conf/:userId')
  .get(emailController.confirmVer)

router.route('/email/note/send')
  .post(secureRoute, emailController.sendNote)

module.exports = router