const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(201).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(409).json({message: "User already exists!"});
    }
  }
  return res.status(400).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    resolve(books);
  });

  getBooksPromise.then((bookList) => {
    res.status(200).send(JSON.stringify(bookList, null, 2));
  }).catch((error) => {
    console.error('Error fetching books:', error);
    res.status(500).json({message: "Failed to fetch books"});
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  // Assuming the index is the ISBN
  const getBookDetails = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject('Book not found');
    }
  });

  getBookDetails.then((bookDetails) => {
    res.status(200).send(JSON.stringify(bookDetails, null, 2));
  }).catch((errorMessage) => {
    res.status(204).end();
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const booksOfAuthor = Object.values(books).filter(book => book.author === author);
    if (booksOfAuthor.length > 0) {
      resolve(booksOfAuthor);
    } else {
      reject('No books found for the specified author');
    }
  });

  getBooksByAuthor.then((booksDetails) => {
    res.status(200).send(JSON.stringify(booksDetails, null, 2));
  }).catch((errorMessage) => {
    res.status(204).end();
  });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  // Wrapping the book retrieval in a Promise
  const getBooksByTitle = new Promise((resolve, reject) => {
    const booksWithTitle = Object.values(books).filter(book => book.title === title);
    if (booksWithTitle.length > 0) {
      resolve(booksWithTitle);
    } else {
      reject('No books found with the specified title');
    }
  });

  getBooksByTitle.then((booksDetails) => {
    res.status(200).send(JSON.stringify(booksDetails, null, 2));
  }).catch((errorMessage) => {
    res.status(204).end();
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && Object.keys(books[isbn].reviews).length > 0) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 2));
  } else {
    return res.status(204).end();
  }
});

module.exports.general = public_users;
