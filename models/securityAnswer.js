/* jslint node: true */
const container = require('../container');
const insecurity = container.build('insecurityNew');

module.exports = (sequelize, { STRING, INTEGER }) => {
  const SecurityAnswer = sequelize.define('SecurityAnswer', {
    answer: {
      type: STRING,
      set (answer) {
        this.setDataValue('answer', insecurity.hmac(answer))
      }
    },
    UserId: { type: INTEGER, unique: true }
  })

  SecurityAnswer.associate = ({ User, SecurityQuestion }) => {
    SecurityAnswer.belongsTo(User)
    SecurityAnswer.belongsTo(SecurityQuestion, { constraints: true, foreignKeyConstraint: true })
  }

  return SecurityAnswer
}
