const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

/**
 * Khởi động MongoDB in-memory server và kết nối
 */
const connect = async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}

/**
 * Xóa toàn bộ dữ liệu trong tất cả collections
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

/**
 * Đóng kết nối và dừng server
 */
const disconnect = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

module.exports = { connect, clearDatabase, disconnect }
