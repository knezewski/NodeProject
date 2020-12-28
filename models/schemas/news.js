const mongoose = require('mongoose')

const Schema = mongoose.Schema
const newsSchema = new Schema(
   {
      text: {
         type: String,
      },
      title: {
         type: String,
      },
      user: {
         type: mongoose.SchemaTypes.ObjectId,
         ref:'user'
      },
   },
   {
      versionKey: false,
      timestamps: true
   }
)

const News = mongoose.model('new', newsSchema)

module.exports = News