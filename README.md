# moxymapper
Data mapping made easy

## Usage
```typescript
const MoxyMapper = require('moxy-mapper').MoxyMapper

let src = {
    age: 21,
    bio: 'My name is John and I\'m an alcoholic',
    medical_history: {
        heart_disease: true,
    },
    name: 'John Doe',
    street: '123 Main St. APT 3',
    registered: '2019-05-05',
    tobacco_use: true,
}

let dest = {
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
}

let jsonToConvert = {
    age: 25,
    bio: 'My name is Mark',
    medical_history: {
        heart_disease: false,
    },
    name: 'Mark Hamilton',
    street: '911 Mary Road. SUITE 5',
    registered: '2019-01-01',
    tobacco_use: false,
}

const mapper = new MoxyMapper(src, dest)
const output = mapper.map(jsonToConvert)
console.log(output)
```

Sample output:

```typescript
{
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
```

## Bugs
This project is still in its infancy. Feel free to report or fix any bugs that you see. Take caution if you plan to use this in a production app.

## Donations appreciated
If you find any of my GitHub projects useful, feel free to [donate here](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=EUDNKJR7GS3UQ&source=url)!

## Support
If you need support on any of the projects listed on my GitHub, feel free to reach out to me on my [LinkedIn](https://www.linkedin.com/in/daniel-moxon/) and we can work something out!