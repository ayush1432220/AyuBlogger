import {initData} from './db.js'
import {Post} from '../models/post.js'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });



const dbURL = process.env.DBURL;
// initData.forEach((obj)=>{
//     console.log(obj)
// })
if(!dbURL){
    console.log("Atlas URL doesn't exist")
}
export const initDb = async()=>{
     try{
        await Post.deleteMany({});
        console.log("All Posts deleted!");
         const updatedData=initData.map((obj)=>({...obj,owner : "689b3e73710bd2b64341357b"}));
        await Post.insertMany(updatedData);
        console.log("Data was initialized");
    }catch(e){
        console.log(e);
    }

}
async function main(){
    try{
        await mongoose.connect(dbURL, {
            useNewUrlParser: false,
            useUnifiedTopology: false,
            serverSelectionTimeoutMS: 30000
        });
        console.log("Database Created Successfully");
        await initDb();
    }catch(e){
        console.log(e);
    }

}
main();

