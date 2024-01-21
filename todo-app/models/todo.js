"use strict";
//const { use } = require("passport");
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static getCompletedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    static getOverdues(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    static getDuetoday(userId) {
      return this.findAll({
        where: {
          dueDate: new Date().toISOString().split("T")[0],
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    static getDueLater(userId) {
      let tom = new Date().setDate(new Date().getDate() + 1);
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: tom,
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    setCompletionStatus(stat) {
      return this.update({ completed: !stat });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
