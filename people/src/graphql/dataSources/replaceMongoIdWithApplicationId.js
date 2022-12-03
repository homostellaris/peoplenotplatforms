function replaceMongoIdWithApplicationId(document) {
  document.id = document._id.toHexString()
  delete document._id
  return document
}

module.exports = replaceMongoIdWithApplicationId
