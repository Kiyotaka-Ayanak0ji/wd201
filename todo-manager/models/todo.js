"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static getCompletedTodos() {
      return this.findAll({
        where:{
          completed: true
        },
        order: [["id", "ASC"]],
      });
    }

    static getOverdues() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
        },
        order: [["id", "ASC"]],
      });
    }

    static getDuetoday() {
      return this.findAll({
        where: {
          dueDate: new Date().toISOString().split("T")[0],
        },
        order: [["id", "ASC"]],
      });
    }

    static getDueLater() {
      let tom = new Date().setDate(new Date().getDate() + 1);
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: tom,
          },
        },
        order: [["id", "ASC"]],
      });
    }

    setCompletionStatus(stat){
      return this.update({completed: stat});
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        }
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
