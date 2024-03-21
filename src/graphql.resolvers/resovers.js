const User = require("../models/model.users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Book = require("../models/model.books");
const UserBook = require("../models/model.UserBook");
const { uploadImage } = require("../services/cloudinary");

function geneerateToken(id) {
  return jwt.sign({ userId: id }, process.env.TOKEN_SECRET);
}

const resolvers = {
  Query: {
    users: async (_, __, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user please log in");
        }
        const users = await User.findAll({
          include: [Book],
        });
        const usersWithBooks = users.map((user) => ({
          ...user.dataValues,
          book: user.Books.map((book) => book.dataValues),
        }));
        return usersWithBooks;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    books: async (_, __, { userId }) => {
      if (!userId) {
        throw new Error("Unauthorized user pleass logged in");
      }
      return await Book.findAll();
    },

    queryBookStatus: async (_, { status }, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user please log in");
        }
        const books = await Book.findAll({ where: { status: status } });
        return books;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    signupUser: async (_, { newUser }) => {
      try {
        const existingUser = await User.findOne({
          where: { email: newUser.email },
        });
        if (existingUser) {
          throw new Error("User Already exists with that email");
        }

        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        let signupser = await User.create({
          name: newUser.name,
          email: newUser.email,
          password: hashedPassword,
          role: newUser.role,
        });
        return signupser;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    signinUser: async (_, { userLoginInput }) => {
      try {
        CheckUser = await User.findOne({
          where: { email: userLoginInput.email },
        });
        if (!CheckUser) {
          throw new Error("User Does not Exists");
        }
        const doMatch = await bcrypt.compare(
          userLoginInput.password,
          CheckUser.password
        );
        if (!doMatch) {
          throw new Error("email or password is wrong");
        }
        const token = await geneerateToken(CheckUser.id);
        return {
          token,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    addBook: async (_, { book }, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user pleass logged in");
        }
        const checkUser = await User.findOne({ where: { id: userId } });
        if (checkUser.role !== "admin") {
          throw new Error("only Admin Add Book");
        }
        const imageUrl = await uploadImage(book.image);
        const newBook = {
          title: book.title,
          author: book.author,
          imageUrl: imageUrl,
        };
        const createdBook = await Book.create(newBook);
        return createdBook;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    edditBookDetail: async (_, { edditbook }, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user pleass logged in");
        }

        const checkUser = await User.findOne({ where: { id: userId } });
        if (checkUser.role !== "admin") {
          throw new Error("only Admin Can Eddit Book");
        }

        const imageUrl = await uploadImage(edditbook.image);
        const newBook = {
          title: edditbook.title,
          author: edditbook.author,
          imageUrl: imageUrl,
        };

        const edditedBook = await Book.update(newBook, {
          where: { id: edditbook.id },
        });
        return { message: "successfully Updated" };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    deleteBook: async (_, { id }, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user pleass logged in");
        }

        const checkUser = await User.findOne({ where: { id: userId } });
        if (checkUser.role !== "admin") {
          throw new Error("only Admin Can Delete Book");
        }

        const deletedBook = await Book.destroy({
          where: { id },
        });
        return { message: "successfully Deleted" };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    borrowedOrSoldBook: async (_, { bookIdandStatus }, { userId }) => {
      try {
        if (!userId) {
          throw new Error("Unauthorized user pleass logged in");
        }

        const checkBook = await Book.findOne({
          where: { id: bookIdandStatus.id },
        });
        if (!checkBook) return { message: "book does not exists" };

        if (checkBook.status !== "available")
          return { message: "book is already sold or borrowed" };

        if (checkBook.status === "available") {
          const updateduserBook = await UserBook.create({
            UserId: userId,
            BookId: bookIdandStatus.id,
          });
          const updatedBook = await Book.update(
            { status: bookIdandStatus.status },
            { where: { id: bookIdandStatus.id } }
          );
          return {
            message: `successfully ${bookIdandStatus.status}`,
          };
        }
      } catch (error) {
        console.log("error>>>>..", error);
        throw new Error(error.message);
      }
    },
  },
};

module.exports = resolvers;
