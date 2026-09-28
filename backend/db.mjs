import mongoose from "mongoose";

let connectionPromise;
export function connectDatabase(){if(mongoose.connection.readyState===1)return Promise.resolve(mongoose.connection);if(!connectionPromise){const uri=process.env.MONGODB_URI?.trim();if(!uri)throw new Error("MONGODB_URI is required");const dbName=process.env.DB_NAME?.trim()||"solarious";mongoose.set("strictQuery",true);connectionPromise=mongoose.connect(uri,{dbName,serverSelectionTimeoutMS:10000,maxPoolSize:10,minPoolSize:1,retryWrites:true}).then(()=>mongoose.connection).catch(error=>{connectionPromise=undefined;throw error})}return connectionPromise}
export function databaseStatus(){return{connected:mongoose.connection.readyState===1,state:["disconnected","connected","connecting","disconnecting"][mongoose.connection.readyState]||"unknown",name:mongoose.connection.name||process.env.DB_NAME||"solarious"}}
export async function disconnectDatabase(){if(mongoose.connection.readyState!==0)await mongoose.disconnect()}
export {mongoose};
