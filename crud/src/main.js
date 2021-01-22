require('dotenv').config()
const MilleFeuille = require('@frenchpastries/millefeuille')
const {
  get,
  notFound,
  context,
  ...Assemble
} = require('@frenchpastries/assemble')
const { response, forbidden } = require('@frenchpastries/millefeuille/response')
const { log } = require('./utils/logger')
const { client, connect } = require('./db')

console.log(process.env.COUCOU)
connect()
// const helloWorldHandler = request => ({
//   statusCode: 200,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: 'Hello World from MilleFeuille!',
// })
const selectById = id => {
  return { text: 'SELECT * FROM seafood WHERE id = $1', values: [id] }
}

const updateOrInsert = (exist, id, info) => {
  if (exist) {
    log('update', { id, info })
    return {
      text: 'UPDATE seafood SET info = $2 WHERE id = $1 RETURNING id',
      values: [id, info],
    }
  } else {
    log('create', { id, info })
    if (id) {
      return {
        text: 'INSERT INTO seafood (id, info) VALUES ($1, $2) RETURNING id',
        values: [id, info],
      }
    } else {
      return {
        text: 'INSERT INTO seafood (info) VALUES ($1) RETURNING id',
        values: [info],
      }
    }
  }
}

const getSeafood = async ({ id }) => {
  log({ id })
  const query = selectById(id)
  const { rows } = await client.query(query)
  log(rows)
  return response(JSON.stringify(rows))
}

const createOrUpdate = async ({ id, info: infoStr }) => {
  log(id, infoStr)
  const old = await getSeafood({ id })
  log(Object.keys(old))
  const exist = JSON.parse(old.body)
  const info = JSON.parse(infoStr)
  const query = updateOrInsert(exist.length !== 0, id, info)
  const { rows } = await client.query(query)
  log(rows)
  log('done')
  return response(rows[0].id)
}

const createOrUpdateProfilesHandler = async ({ url }) => {
  const { id, info } = url.query
  log({ id, info })
  return createOrUpdate({ id, info })
}

const getProfilesHandler = async ({ url }) => {
  const { id } = url.query
  if (id) {
    return getSeafood({ id })
  } else {
    return forbidden('no value')
  }
}

const ok = () => response('OK')

const handler = Assemble.routes([
  get('/', ok),
  context('/seafood', [
    get('/', getProfilesHandler),
    get('/create', createOrUpdateProfilesHandler),
  ]),
  notFound(() => ({ statusCode: 404 })),
])

MilleFeuille.create(handler)
console.log('-----> Server up and running at port ' + process.env.PORT)
