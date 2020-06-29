exports.User = class {
  constructor(data) {
    const {
        sub,
        name,
        email,
    } = data;
    const username = data['cognito:username'];

    this.id = sub;
    this.name = name;
    this.email = email;
    this.username = username;
    try {
    } catch (e) {
        return null;
    }
  }
};
