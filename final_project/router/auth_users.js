const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userCheck = users.filter((user)=>user.username ===username)
if(userCheck.length>0){
  return false;
}
else{
  return true
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let user = username;
let userCheck = users.filter((i)=>i.username === user)
if(userCheck.length>0 && userCheck[0].password === password ){
  return true
}
else
{
  return false
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
  let user = req.body.username

  if(authenticatedUser(user, req.body.password)){
  
      let token = jwt.sign({data: req.body.password},'secret_key',{expiresIn: 60*10})
      req.session.authorization = {token,user}
      res.status(200).json({message: "You are logged in succcessfully"})
   
  }
  else{
    return res.status(404).json({message: `${user} not found or something went wrong`});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  var user = req.session.authorization.user;
  let isbn = req.params.isbn;
  let review = req.body.review
  var review_index
  var book = books[isbn]
  const review_exists = book.reviews.filter((i,index)=>{review_index = index; return i.username === user})
  if(book)
  {
    if(book.reviews.length === 0 || review_exists.length === 0)
    {
      let new_review = { 'username': user, 'comment': review }
      book.reviews.push(new_review)
      res.status(200).json({message: 'Review successfully submitted', reviews: book.reviews})
    }
    else{
        // review_exists[0].comment = review
      book.reviews[review_index].comment = review
      book.reviews[review_index].username = user
      res.status(200).json({message: 'Review successfully updated', review: book.reviews[review_index]})

    }
  }
  else{
    res.status(404).json({message: `No Book is found for the ISBN: ${isbn}`})
  }

});

// deleting a user review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  var user = req.session.authorization.user;
  let isbn = req.params.isbn;
  var review_index
  var book = books[isbn]
  const review_exists = book.reviews.filter((i,index)=>{review_index = index; return i.username === user})

  book.reviews.splice(review_index,1)
  
  res.status(200).json({message: "Your review is successfully Deleted", book: book})

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
