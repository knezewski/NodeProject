const tokens = require('../auth/tokens')
const passport = require('passport')
const db = require('../models')
const helper = require('../helpers/serialize')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const storeImage = path.join(process.cwd(), 'images')

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
}).single('myImage');

const uploadImage = (upload, async (req, res, next) => {
  const { description } = req.body
  const { path: temporaryName, originalname } = req.file
  const fileName = path.join(storeImage, originalname)
  try {
    await fs.rename(temporaryName, fileName)
  } catch (err) {
    await fs.unlink(temporaryName)
    return next(err)
  }
  res.json({ description, message: 'Файл успешно загружен', status: 200 })
})

const postReg = async (req, res) => {
   const { username } = req.body
   const user = await db.getUserByName(username)
   if (user) {
      return res.status(409).json({})
   } try {
      const newUser = await db.createUser(req.body)
      const token = await tokens.createTokens(newUser)
      res.json({
         ...helper.serializeUser(newUser),
         ...token,
      })
   } catch (err) {
      console.log(err)
      res.status(500).json({ message: err.message })
   }
}

const postLogin = async (req, res, next) => {
   passport.authenticate(
      'local',
      { session : false },
      async ( err, user, info ) => {
        console.log(user);
         if (err) {
            return next(err)
         }
         if (!user) {
            return res.status(400).json({})
         }
         if (user) {
            const token = await tokens.createTokens(user)
            console.log(token)
            res.json({
               ...helper.serializeUser(user),
               ...token,
            })
         }
      },
   )(req, res, next)
}

const postRefreshToken = async (req, res) => {
   const refreshToken = req.headers['authorization']
   const data = await tokens.refreshTokens(refreshToken)
   res.json({ ...data })
}

const getProfile = async (req, res) => {
     const user = req.user
     res.json({
       ...helper.serializeUser(user),
     })
   }

const patchProfile =  async (req, res) => {
     console.log(`PATH: req.body: `)
     console.log(req.body)
     // TODO:
     const user = req.user
     res.json({
       ...helper.serializeUser(user),
     })
   }

const getUsers =  async (req, res) => {
     const user = req.user
     if (!user.permission.settings.R) {
       return res.status(403).json({
         code: 403,
         message: 'Forbidden',
       })
     }
     const users = await db.getUsers()
     res.json(users.map((user) => helper.serializeUser(user)))
   }

const patchUsersPermission = async (req, res, next) => {
     try {
       const user = req.user
       if (!user.permission.settings.U) {
         return res.status(403).json({
           code: 403,
           message: 'Forbidden',
         })
       }
       const updatedUser = await db.updateUserPermission(req.params.id, req.body)
       res.json({
         ...helper.serializeUser(updatedUser),
       })
     } catch (e) {
       next(e)
     }
   }

const deleteUser =  async (req, res) => {
     const user = req.user
     if (!user.permission.settings.D) {
       return res.status(403).json({
         code: 403,
         message: 'Forbidden',
       })
     }
     await db.deleteUser(req.params.id)
     res.status(204).json({})
   }

const getNews =  async (req, res, next) => {
     try {
       const user = req.user
       if (!user.permission.news.R) {
         return res.status(403).json({
           code: 403,
           message: 'Forbidden',
         })
       }
       const news = await db.getNews()
       return res.json(news)
     } catch (e) {
       next(e)
     }
   }

const postNews = async (req, res, next) => {
     try {
       const user = req.user

       if (!user.permission.news.C) {
         return res.status(403).json({
           code: 403,
           message: 'Forbidden',
         })
       }

       await db.createNews(req.body, user)
       const news = await db.getNews()
       res.status(201).json(news)
     } catch (e) {
       next(e)
     }
   }

const patchNews = async (req, res, next) => {
     try {
       const user = req.user

       if (!user.permission.news.U) {
         return res.status(403).json({
           code: 403,
           message: 'Forbidden',
         })
       }

       await db.updateNews(req.params.id, req.body)
       const news = await db.getNews()
       res.json(news)
     } catch (e) {
       next(e)
     }
   }

const deleteTheNews = async (req, res, next) => {
     try {
       const user = req.user
       if (!user.permission.news.D) {
         return res.status(403).json({
           code: 403,
           message: 'Forbidden',
         })
       }
       await db.deleteNews(req.params.id)
       const news = await db.getNews()
       res.json(news)
     } catch (e) {
       next(e)
     }
   }

module.exports = {
  uploadImage,
   postReg,
   postLogin,
   postRefreshToken,
   getProfile,
   patchProfile,
   patchUsersPermission,
   getUsers,
   deleteUser,
   getNews,
   postNews,
   patchNews,
   deleteTheNews,
}
