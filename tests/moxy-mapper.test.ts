import assert from 'assert'
const MoxyMapper = require('../moxy-mapper').MoxyMapper

describe('moxy-mapper test suite', () => {
    it('should map data from one format to another', () => {
        const tests = [
            {
                src: {
                    age: 21,
                    bio: 'My name is John and I\'m an alcoholic',
                    medical_history: {
                        heart_disease: true,
                    },
                    name: 'John Doe',
                    street: '123 Main St. APT 3',
                    registered: '2019-05-05',
                    tobacco_use: true,
                },
                dest: {
                    bio: 'My name is John and I\'m an alcoholic',
                    demographics: {
                        age: 21,
                        tobaccoUse:  true,
                        heartDisease: true,
                    },
                    firstName: 'John',
                    lastName: 'Doe',
                    address: {
                        street1: '123 Main St.',
                        street2: 'APT 3',
                    },
                    registered: '2019-05-05',
                },
                srcTest: {
                    age: 25,
                    bio: 'My name is Mark',
                    medical_history: {
                        heart_disease: false,
                    },
                    name: 'Mark Hamilton',
                    street: '911 Mary Road. SUITE 5',
                    registered: '2019-01-01',
                    tobacco_use: false,
                },
                expected: {
                    bio: 'My name is Mark',
                    demographics: {
                        age: 25,
                        tobaccoUse:  false,
                        heartDisease: false,
                    },
                    firstName: 'Mark',
                    lastName: 'Hamilton',
                    address: {
                        street1: '911 Mary Road',
                        street2: 'SUITE 5',
                    },
                    registered: '2019-01-01',
                }
            },
            {
                src: {
                    age: 21,
                    bio: 'My name is John and I\'m an alcoholic',
                    medical_history: {
                        heart_disease: true,
                    },
                    name: 'John Doe',
                    street: '123 Main St. APT 3',
                    registered: '2019-05-05',
                    tobacco_use: true,
                },
                dest: {
                    bio: 'My name is John and I\'m an alcoholic',
                    demographics: {
                        age: 21,
                        tobaccoUse:  true,
                        heartDisease: true,
                    },
                    firstName: 'John',
                    lastName: 'Doe',
                    address: {
                        street1: '123 Main St.',
                        street2: 'APT 3',
                    },
                    registered: '2019-05-05',
                },
                srcTest: {
                    age: 25,
                    medical_history: {
                        heart_disease: false,
                    },
                    name: 'Mark Hamilton',
                    street: '911 Mary Road. SUITE 5',
                    registered: '2019-01-01',
                    tobacco_use: false,
                },
                expected: {
                    bio: undefined,
                    demographics: {
                        age: 25,
                        tobaccoUse:  false,
                        heartDisease: false,
                    },
                    firstName: 'Mark',
                    lastName: 'Hamilton',
                    address: {
                        street1: '911 Mary Road',
                        street2: 'SUITE 5',
                    },
                    registered: '2019-01-01',
                }
            },
        ]

        tests.forEach((test) => {
            const mapper = new MoxyMapper(test.src, test.dest)
            const output = mapper.map(test.srcTest)
            assert.deepEqual(output, test.expected)
        })
    })
})
