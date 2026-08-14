import { it, describe, expect } from 'vitest'
import { User } from '../../../src/domain/entities/user'

describe('User', () =>{
    const validProperties = {
        name: "João Silva",
        email: "joão@gmail.com",
        passwordHash: "password123"
    }

    describe ('create()', () => {
        it('Deve criar um user válido', () => {
            const user = User.create(validProperties)

            expect(user.name).toBe('João Silva')
            expect(user.email).toBe('joão@gmail.com')
            expect(user.passwordHash).toBe('password123')
        })
        it('Deve gerar um id', () => {
            const user = User.create(validProperties)

            expect(user.id).toBeDefined()
            expect(typeof user.id).toBe('string')
            expect(user.id.length).toBeGreaterThan(0)
        })
        it('Deve definir createdAt', () => {
            const user = User.create(validProperties)
            expect(user.createdAt).toBeInstanceOf(Date)
        })
    })

    describe('create() - validação de name', () =>{
        it('Nome não pode ser vazio', () => {
            expect( () => User.create({ ...validProperties, name:'' })).toThrow( 'O nome é obrigatório' )
        })
    })
    describe('create() — validação de email', () => {

    it('deve lançar erro se o email não tiver @', () => {
      expect(() =>
        User.create({ ...validProperties, email: 'emailsemarroba.com' })).toThrow('O email é inválido')
        })

    it('deve lançar erro se o email não tiver domínio', () => {
      expect(() =>
        User.create({ ...validProperties, email: 'email@' })
      ).toThrow('O email é inválido')
        })

    it('deve lançar erro se o email tiver espaços', () => {
      expect(() =>
        User.create({ ...validProperties, email: 'email @email.com' })
      ).toThrow('O email é inválido')
        })
    })    

    describe('createFromPrimitives()', () => {

    it('deve recriar um usuário a partir de dados primitivos', () => {
      const data = new Date('2024-01-01')

      const user = User.createFromPrimitives({
        id: 'uuid-123',
        name: 'Maria',
        email: 'maria@email.com',
        passwordHash: 'hash_456',
        createdAt: data,
      })

      expect(user.id).toBe('uuid-123')
      expect(user.name).toBe('Maria')
      expect(user.email).toBe('maria@email.com')
      expect(user.createdAt).toEqual(data)
    })

  })

})




