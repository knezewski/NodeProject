const express = require('express')
const router = express.Router()
const passport = require('passport')
const ctrl = require('../controllers')


const auth = (req, res, next) => {
   passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (!user || err) {
         return res.status(402).json({
            code: 401,
            message: 'Unauthorized',
         })
      }
      req.user = user
      next()
   })(req, res, next)
}



router.post('/registration', ctrl.postReg)

router.post('/login', ctrl.postLogin)

router.post('/refresh-token', ctrl.postRefreshToken)

router.get('/profile', auth, ctrl.getProfile)

router.patch('/profile', auth, ctrl.patchProfile)

router.get('/users', auth, ctrl.getUsers)

router.patch('/users/:id/permission', auth, ctrl.patchUsersPermission)

router.delete('/users/:id', auth, ctrl.deleteUser)

router.get('/news', auth, ctrl.getNews)

router.post('/news', auth, ctrl.postNews)

router.patch('/news/:id', auth, ctrl.patchNews)

router.delete('/news/:id', auth, ctrl.deleteTheNews)

router.post('/profile', auth, ctrl.uploadImage)

module.exports = router