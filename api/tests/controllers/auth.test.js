const app = require('../../app')
const request = require('supertest')

describe('POST signup', () => {
  test('without fields', () => {
    request(app)
      .post('/api/signup')
      .then((res) => {
        const response = res.body
        const error = response.error
        expect(error.code).toBe(400)
        expect(error.message).toBe('Missing required fields')
        expect(error.status).toBe('INVALID_ARGUMENT')
        expect(error.details[0].message).toBe('Un ou plusieurs champs requis n\'ont pas été remplis')
      })
  })

  test('with invalid address email format', () => {
    request(app)
      .post('/api/signup')
      .field('email', 'eeeee_aaaaa.fr')
      .then((res) => {
        const response = res.body
        const error = response.error
        console.log('ERROR', res)
        expect(error.code).toBe(400)
        expect(error.message).toBe('Invalid format email')
        expect(error.status).toBe('INVALID_ARGUMENT')
        expect(error.details[0].message).toBe('Respecter le format d\'une adresse mail')
      })
  })
})
