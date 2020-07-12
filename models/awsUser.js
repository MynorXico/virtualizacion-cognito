exports.awsUser = class {
  constructor(data) {
    const { Username, Attributes, Groups } = data;
    this.username = Username;
    this.id = Attributes.find((item) => item.Name == "sub").Value;
    this.name = Attributes.find((item) => item.Name == "name").Value;
    this.email = Attributes.find((item) => item.Name == "email").Value;
    this.groups = Groups
    console.log("Data: ", data);
    try {
    } catch (e) {
      return null;
    }
  }
}
