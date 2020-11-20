require('dotenv').config()
const Users = require('../models/users')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.sendgirdapikey)


function sendVer(req, res) {
  const id = req.params.userId

  Users
    .findById(id)
    .then(user => {
      if (!user) return res.send({
        message: 'No user found'
      })

      const msg = {
        from: 'FindaPint <lee@leejburgess.co.uk>',
        to: `${user.email}`,
        subject: 'Verify Email',
        html: `To verify email please follow this link 
        href="https://project-3-adam.herokuapp.com/email/ver/${user._id}'>
        Click here to add your email address to a mailing list`
      }
      sgMail
        .send(msg)
        .then((user) =>{
          res.send(user)
        })
        .catch((error) => res.send(error))
    })

}


function confirmVer(req, res) {
  const id = req.params.userId

  Users
    .findById(id)
    .then(user => {
      if (!user) return res.send({
        message: 'No user found'
      })

      if (user.isEmailConfirmed === true) return res.status(401).send({
        message: 'Email already confirmed'
      })

      user.isEmailConfirmed = true

      user.save()
    })
    .then(user => res.send(user))
}


function sendNote(req, res){
  req.body.user = req.currentUser
  const msg = req.body

  sgMail
    .send(msg)
    .then(() => res.status(200).send('All good!'))
    .catch((error) => res.send(error))
}

module.exports = {
  sendVer,
  confirmVer,
  sendNote
}