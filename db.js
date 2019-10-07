const Sequelize = require('sequelize');
const { UUID, UUIDV4, STRING } = Sequelize;
const jwt = require('jwt-simple');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_JWT_db', {
  logging: false
});

const User = conn.define('user', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true 
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: STRING,
    allowNull: false
  }
});

User.authenticate = async function(credentials){
  const { email, password } = credentials
  const user = await User.findOne({
    where: { email, password }
  })
  if(user){
    return jwt.encode( {id: user.id}, process.env.SECRET);
  }
  throw ({ status: 401 })
}

User.findByToken = async function(token){
  let id;
  try{
    id = jwt.decode(token, process.env.SECRET).id;
    const user = await this.findByPk(id);
    return user
  }catch(ex){
    throw ({ status: 401 })
  }
}


const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const users = [
    { name: 'moe' },
    { name: 'larry' },
    { name: 'lucy' },
    { name: 'ethyl' }
  ];
  const [moe, larry, lucy, ethyl] = await Promise.all(
      users.map( user => User.create({ email: `${user.name}@gmail.com`, password: user.name.toUpperCase()}))
  );
  return {
    moe,
    larry,
    lucy,
    ethyl
  }
};

module.exports = {
  models: {
    User
  },
  syncAndSeed
};
