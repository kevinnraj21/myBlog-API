import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://127.0.0.1:27017/blog-postDB");
const postSchema = new mongoose.Schema({
  id:Number,
  title:{ type:String, require:[true, "Please enter a Title to your blog-post"]},
  content:String,
  author:String,
  date:String
});
const BlogPost = mongoose.model("blogpost", postSchema);

const defaultPost = [{
  id: 1,
  title: "The Rise of Decentralized Finance",
  content:
    "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
  author: "Alex Thompson",
  date: "Mon Jan 22 2024 20:12:19 GMT+0530 (India Standard Time)",
}];
let lastId = 1;


//GET All posts
app.get("/posts", async(req,res)=>{
  // console.log(posts);
  const result = await BlogPost.find({});
  if(result.length===0){
    BlogPost.insertMany(defaultPost);
    res.json(defaultPost);
  }
  else{
    res.json(result);
  }
});

//GET a specific post by id
app.get("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);
  const post = await BlogPost.findOne({id:id});
  if(post)
    res.json(post);
  else
    res.status(404).json({error:`Post with id: ${id} not found.`});
});

//POST a new post
app.post("/posts", (req,res)=>{
  const newPost = new BlogPost({
    id: lastId+1,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date()
  });
  newPost.save();
  lastId = lastId+1;
  res.status(201).json(newPost);
});

//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);

  try{
    const post = await BlogPost.findOne({id:id});
    // console.log(req.body);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const updatedPost = {
      id: id,
      title: req.body.title || post.title,
      content: req.body.content || post.content,
      author: req.body.author || post.author,
      date: post.date
    };
    const updated = await BlogPost.findOneAndReplace({id:id}, updatedPost, {new: true});
    // console.log(updatedPost);
    res.status(200).json(updated);

  } catch(error){
    console.log("Error updating post", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//DELETE a specific post by providing the post id.
app.delete("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);
  try{
    const deleted = await BlogPost.deleteOne({id:id});
    res.status(200).json(deleted);
  } 
  catch(error){
    console.log("Error deleting post", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
