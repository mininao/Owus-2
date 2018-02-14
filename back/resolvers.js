import { db, User, Transaction } from './database';
import { Op } from 'sequelize';

const resolvers = {
  Query: {
    user: (r, args) => {
      return User.findById(1);
    },
  },
  Mutation: {
    createTransaction: async (r, args) => {
      const lender = await User.findById(args.lender);
      const borrowers = await User.findAll({
        where: {
          id: {
            [Op.in]: args.borrowers,
          },
        },
      });

      let transaction = await lender.createLoan(args);
      await transaction.setBorrowers(borrowers);
      console.log(transaction);
    },
  },
  User: {
    transactions: user => {
      return db.query(
        `SELECT DISTINCT transactions.*
        FROM transactions
        LEFT JOIN users as lender ON lender.id = transactions."lenderId"
        LEFT JOIN borrower_debts ON borrower_debts."transactionId" = transactions.id
        LEFT JOIN users as borrower ON borrower_debts."userId" = borrower.id
        WHERE borrower.id = :userId
        OR lender.id = :userId
        `,
        {
          replacements: { userId: user.id },
          model: Transaction,
          type: db.QueryTypes.SELECT,
        },
      );
    },
    friends: user => [
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        picture: 'http://placehold.it/430x430',
      },
      {
        id: 3,
        firstName: 'Jack',
        lastName: 'Daniels',
        picture: 'http://placehold.it/430x430',
      },
      {
        id: 4,
        firstName: 'Big',
        lastName: 'Shaq',
        picture: 'http://placehold.it/430x430',
      },
    ],
  },
  Transaction: {
    lender: transaction => transaction.getLender(),
    borrowers: transaction => transaction.getBorrowers(),
  },
};

export default resolvers;
