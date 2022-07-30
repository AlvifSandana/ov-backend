import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Users = db.define('users', {
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  refresh_token: {
    type: DataTypes.TEXT
  }
}, {
  freezeTableName: true
});

( async () => { await db.sync(); })();

export default Users;
