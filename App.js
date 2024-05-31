const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;
const app = express();
const jsonParser = express.json();
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/");
app.use(express.static(`${__dirname}/public`));
(async () => {
try {
await mongoClient.connect();
app.locals.collection =
mongoClient.db("usersdb").collection("users");
app.listen(3000);
console.log("Сервер ожидает подключения...");
}catch(err) {
return console.log(err);
}
})();
app.get("/api/users", async(req, res) => {
const collection = req.app.locals.collection;
try{
const users = await collection.find({}).toArray();
res.send(users);
}
catch(err){
console.log(err);
res.sendStatus(500);
}
});
app.get("/api/users/:id", async(req, res) => {
const collection = req.app.locals.collection;
try{
const id = new objectId(req.params.id);
const user = await collection.findOne({_id: id});
if(user) res.send(user);
else res.sendStatus(404);
}
catch(err){
console.log(err);
res.sendStatus(500);
}
});
app.post("/api/users", jsonParser, async(req, res)=> {
if(!req.body) return res.sendStatus(400);
const userName = req.body.name;
const userAge = req.body.age;
const user = {name: userName, age: userAge};
const collection = req.app.locals.collection;
try{
await collection.insertOne(user);
res.send(user);
}
catch(err){
console.log(err);
res.sendStatus(500);
}
});
app.delete("/api/users/:id", async(req, res)=>{
const collection = req.app.locals.collection;
try{
const id = new objectId(req.params.id);
const result = await collection.findOneAndDelete({_id: id});
const user = result.value;
if(user) res.send(user);
else res.sendStatus(404);
}
catch(err){
console.log(err);
res.sendStatus(500);
}
});
app.put("/api/users", jsonParser, async(req, res)=>{
if(!req.body) return res.sendStatus(400);
const userName = req.body.name;
const userAge = req.body.age;
const collection = req.app.locals.collection;
try{
const id = new objectId(req.body.id);
const result = await collection.findOneAndUpdate({_id: id}, { $set:
{age: userAge, name: userName}},
{returnDocument: "after" });
const user = result.value;
if(user) res.send(user);
else res.sendStatus(404);
}
catch(err){
console.log(err);
res.sendStatus(500);
}
});
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", async() => {
await mongoClient.close();
console.log("Приложение завершило работу");
process.exit();
});
