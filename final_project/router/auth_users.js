const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(400).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user= req.session.authorization.username;
  const comment = req.body.comment;
  const book = books[req.params.isbn];

  if (!comment) {
    return res.status(400).json({ message: 'No comment provided' });
  }
  book.reviews[user] = comment;

  return res.status(200).json({ message: `Review was saved'}` });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Check if the user's review exists
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: 'Review was deleted' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
