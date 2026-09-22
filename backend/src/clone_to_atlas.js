const mongoose = require('mongoose');

async function migrate(atlasUri) {
  if (!atlasUri) {
    console.error('Please provide Atlas URI as argument: node src/clone_to_atlas.js <atlasUri>');
    process.exit(1);
  }

  console.log('Connecting to local MongoDB (127.0.0.1:27017/drivecare_db)...');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/drivecare_db').asPromise();
  console.log('Local MongoDB connected successfully.');

  console.log('Connecting to Atlas Cloud MongoDB...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('Atlas Cloud MongoDB connected successfully.');

  const collections = await localConn.db.listCollections().toArray();
  for (const col of collections) {
    const name = col.name;
    const docs = await localConn.db.collection(name).find({}).toArray();
    console.log(Migrating  documents from collection " \...);
 if (docs.length > 0) {
 await atlasConn.db.collection(name).deleteMany({});
 await atlasConn.db.collection(name).insertMany(docs);
 }
 }

 console.log('======================================================');
 console.log('SUCCESS: All local vehicles, users, & appointments migrated to Atlas!');
 console.log('======================================================');
 await localConn.close();
 await atlasConn.close();
}

const targetUri = process.argv[2];
migrate(targetUri);
