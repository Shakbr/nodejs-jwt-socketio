export default {
  HOST: "127.0.0.1",
  USER: "root",
  PASSWORD: "qwerty123",
  DB: "nodejsjwt",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
