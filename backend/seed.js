const mongoose = require('mongoose')
const pubs = require('./models/pubs')
const users = require('./models/users')
const axios = require('axios')
const { dbURI } = require('./config/environment')


mongoose.connect(
  dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  (err) => {
    if (err) return console.log(err)
    console.log('Mongoose connected!')
    mongoose.connection.db.dropDatabase()
      .then(() => {
        return users.create([{
          username: 'theo',
          email: 'theorlbooth@googlemail.com',
          password: 'password',
          passwordConfirmation: 'password',
          isLandlord: false,
          isAdmin: true,
          // ownedPubs: [],
          // subscribedPubs: [],
          isEmailConfirmed: true,
          locationCoords: {
            latitude: 51.498421,
            longitude: -0.136440
          }
        },
        {
          username: 'lee',
          email: 'lee.j.burgess77@gmail.com',
          password: 'password',
          passwordConfirmation: 'password',
          isLandlord: false,
          isAdmin: true,
          // ownedPubs: [],
          // subscribedPubs: [],
          isEmailConfirmed: false,
          locationCoords: {
            latitude: 51.500351,
            longitude: -0.125570
          }
        },
        {
          username: 'adam',
          email: 'adamlee.osgood@gmail.com',
          password: 'password',
          passwordConfirmation: 'password',
          isLandlord: false,
          isAdmin: true,
          // ownedPubs: [],
          // subscribedPubs: [],
          isEmailConfirmed: true,
          locationCoords: {
            latitude: 51.520840,
            longitude: -0.091149
          }
        }
        ])
      })
      .then(users => {
        console.log(`${users.length} users have been created!`)
        return users
      })
      .then((users) => {
        const promises = []
        const originalPubIDs = ['XroPH96BT4X2zmCX8bvSmg', 'ELAlTCTL7Q6vMkmtn3w0SA', '8pEhDl7SKdRrmYuyunTECg', 'vCpDm3FJ2CH-CJCbrkWaug', 'Oo4Hcw5ReDHZ3C40l8AYlA', 'tA83OLo0GKxfR4c2-4MsDA', 'wS4Za_lcpjM9zTiWCN6V9w', 'fbNfILjB3GdTbd9DVs3G8A', 'aUVwNOO5LXIYh08z0pbneg', 'dpR-I-uspgCWjdeuroWyYQ', '390p3ob0dW9C_AcUu6-CCQ', 'Sqy7jqY73d7NzJUTlt4V-g', 'NsW-FrgdMkt41DfhtZlYtA', '2JpOQc0sE67ktd1cA3d6zQ', 'pbroRuYUQb8iqEsQFhVTUA', 'B_8Yj3zaEP1-e1YeGrgI1Q', 'etN_O5Hbz8g-oNUJDE0eJg', 'b8G4bkvA393ZgwDiZV37tQ', 'SCdYgnZUaaQiCAUnfRxlsg', 'krhpAYE7a2A62efBLg-IRQ', 'i3dITn98pvwx1LILKlfeNg', '09qyAu0mR9Wiq7UiDVjh7A', 'h9Qbu8tTs557fSpIfcQwlw', 'ALrFfRFJOmPMqAKkCsDryQ', 'REsQeOq673VB-zjbZFbnIQ', 'rIxk-LZZzauCzz8QlUIUeA', 'BALneS1FszbdIbYb7vnxag', 'u4a1B85w6MlKein09Z63gA', 'doTIXMhkrOUea2GUp-RJlw', 'QL_1PvFcnJiCOmb061H_gQ', 'V1LvEwooJkj7ml7D25HKeg', 'a00vchtLVLs3NO56A--MJA', '0-v_P1Ayb5VEaNsiGwlNyg', 'YsT5lYqRfHMl0HzLFKzirA', 'i4sDNMJATBgWqjesmJTYgg', 'GwUpy8KMGxBNoQKlqnLJ3A', 'Z4T8zRhah6VV_EK961bVKA', 'zo6i8H4eGRPzJ4KcAFNh6w', '6pSj6_6t5M97xWHuX6A6ew', 'UFzgsteVJgez2OMjUjSBfg', 'bHLLIMeu4mogxoYsGlmcxQ', 'UGTPm9qHpAFoEeEumFOeZA', '3BMj1NhO0k318FkE-H2C1w', 'PQSwt7wMh8D1e-MBPtKCgw', 'c1FZTJSnosoRNI1ujNKzzQ', 'pOjXtN01_QYU9d6Ja3_CBQ', 'TKrgGHkG3zZQyHbXLWVGiA', 'MPTr-vWm__94viQ1Iowhhg', 'Y0CzqNjUyfqfiF44c_dQhQ', '1oShlXeGjTrfD-A1I_iHBw']
        // '8pEhDl7SKdRrmYuyunTECg', 'vCpDm3FJ2CH-CJCbrkWaug', 'Oo4Hcw5ReDHZ3C40l8AYlA', 'tA83OLo0GKxfR4c2-4MsDA', 'wS4Za_lcpjM9zTiWCN6V9w', 'fbNfILjB3GdTbd9DVs3G8A', 'aUVwNOO5LXIYh08z0pbneg', 'dpR-I-uspgCWjdeuroWyYQ', '390p3ob0dW9C_AcUu6-CCQ', 'Sqy7jqY73d7NzJUTlt4V-g', 'NsW-FrgdMkt41DfhtZlYtA', '2JpOQc0sE67ktd1cA3d6zQ', 'pbroRuYUQb8iqEsQFhVTUA', 'B_8Yj3zaEP1-e1YeGrgI1Q', 'etN_O5Hbz8g-oNUJDE0eJg', 'b8G4bkvA393ZgwDiZV37tQ', 'SCdYgnZUaaQiCAUnfRxlsg', 'krhpAYE7a2A62efBLg-IRQ', 'i3dITn98pvwx1LILKlfeNg', '09qyAu0mR9Wiq7UiDVjh7A', 'h9Qbu8tTs557fSpIfcQwlw', 'ALrFfRFJOmPMqAKkCsDryQ', 'REsQeOq673VB-zjbZFbnIQ', 'rIxk-LZZzauCzz8QlUIUeA', 'BALneS1FszbdIbYb7vnxag', 'u4a1B85w6MlKein09Z63gA', 'doTIXMhkrOUea2GUp-RJlw', 'QL_1PvFcnJiCOmb061H_gQ', 'V1LvEwooJkj7ml7D25HKeg', 'a00vchtLVLs3NO56A--MJA', '0-v_P1Ayb5VEaNsiGwlNyg', 'YsT5lYqRfHMl0HzLFKzirA', 'i4sDNMJATBgWqjesmJTYgg', 'GwUpy8KMGxBNoQKlqnLJ3A', 'Z4T8zRhah6VV_EK961bVKA', 'zo6i8H4eGRPzJ4KcAFNh6w', '6pSj6_6t5M97xWHuX6A6ew', 'UFzgsteVJgez2OMjUjSBfg', 'bHLLIMeu4mogxoYsGlmcxQ', 'UGTPm9qHpAFoEeEumFOeZA', '3BMj1NhO0k318FkE-H2C1w', 'PQSwt7wMh8D1e-MBPtKCgw', 'c1FZTJSnosoRNI1ujNKzzQ', 'pOjXtN01_QYU9d6Ja3_CBQ', 'TKrgGHkG3zZQyHbXLWVGiA', 'MPTr-vWm__94viQ1Iowhhg', 'Y0CzqNjUyfqfiF44c_dQhQ', '1oShlXeGjTrfD-A1I_iHBw']

        for (let i = 0; i < originalPubIDs.length; i++) {
          const timeoutInterval = 500 * i
          promises.push(new Promise((resolve) => {
            setTimeout(() => {
              axios.get(`https://api.yelp.com/v3/businesses/${originalPubIDs[i]}`, {
                headers: {
                  Authorization: 'Bearer qBGO6ikkjFcn7jHOP3Ok8gp3sILXemkrbarX-ILin_ONdCcbXPo9JTsNwpehRgo-bDUNxj1aEuuZGMU472wSoFb2SYSeh4tKmPB0JuT5uk0pBxWRX1HMiHX9D7yrX3Yx'
                }
              })
                .then(({ data }) => {
                  const pub = {
                    alias: data.alias,
                    name: data.name,
                    imageUrl: data.image_url,
                    phoneNumber: data.phone,
                    address: data.location,
                    coordinates: data.coordinates,
                    takeAway: Boolean(Math.round(Math.random())),
                    liveSport: Boolean(Math.round(Math.random())),
                    heating: Boolean(Math.round(Math.random())),
                    liveMusic: Boolean(Math.round(Math.random())),
                    outdoorSeating: Boolean(Math.round(Math.random())),
                    description: 'This is a lovely pub with delicious beer. Come and see for yourself!',
                    photos: data.photos,
                    price: data.price,
                    reviewed: true,
                    openingHours: '11-11',
                    transaction: data.transaction,
                    user: users[0]
                  }
                  resolve(pub)
                })
            }, timeoutInterval)
          }))
        }
        return Promise.all(promises)
      })
      .then((pubData) => {
        return pubs.create(pubData)
      })
      .then(pubs => {
        console.log(`${pubs.length} pubs have been created!`)
      })
      .then(err => {
        console.log(err)
      })
      .finally(() => {
        mongoose.connection.close()
      })
  }
)