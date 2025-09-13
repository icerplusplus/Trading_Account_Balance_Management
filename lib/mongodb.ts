import { MongoClient } from 'mongodb'

if (!process.env.MONGO_URL) {
  console.error('MONGO_URL environment variable is missing')
  throw new Error('Please add your Mongo URL to .env.local')
}

console.log('MongoDB URL configured:', process.env.MONGO_URL ? 'Yes' : 'No')

const uri = process.env.MONGO_URL
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Creating new MongoDB client for development')
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  console.log('Creating new MongoDB client for production')
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Test connection
clientPromise
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('MongoDB connection failed:', err))

export default clientPromise