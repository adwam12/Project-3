import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Toggle from 'react-toggle'

import Loader from './Loader'
import examplePubs from './ExamplePubList'

const PubList = () => {

  const [pubsList, updatePubList] = useState([])

  const [takeAwayTog, updateTakeAwayTog] = useState(false)
  const [outdoorSeatingTog, updateOutdoorSeatingTog] = useState(false)
  const [heatingTog, updateHeatingTog] = useState(false)
  const [liveMusicTog, updateLiveMusicTog] = useState(false)
  const [liveSportTog, updateLiveSportTog] = useState(false)
  const [zipCode, setZipCode] = useState('E16AN')
  const [searchResult, setSearchResult] = useState([5, -0.5])
  const [indivLatLong, setIndivLatLong] = useState([])
  const [radius, setRadius] = useState(10)
  const [resetFilter, shouldReset] = useState(true)
  const distArray = []
  const [PubListCopy, CopyPubList] = useState([])



  const toURI = encodeURI(zipCode + '&countrycode=' + 'uk')
  // console.log("URI", toURI)
  const url = `https://api.opencagedata.com/geocode/v1/json?key=${process.env.geo_key}&q=${toURI}&pretty=1`

  function measure(lat1, lon1, lat2, lon2) {
    var R = 6378.137 // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c
    return d // km float
  }

  useEffect(() => {
    axios.get(url)
      .then(axiosResp => {
        setSearchResult(axiosResp.data.results[0].geometry)
      })

  }, [zipCode])

  useEffect(() => {
    measure(searchResult[0], searchResult[1], indivLatLong[0], indivLatLong[1])
  }, [searchResult])


  function DistanceCall(publist) {
    publist.forEach((pub) => {
      return distArray.push((measure(searchResult[0], searchResult[1], pub.coordinates.latitude, pub.coordinates.longitude)))


    }
    )
    // console.log('WHEN DONE:', distArray)
  }

  function filterPubByDistance(publist) {
    resetSearch()

    return setTimeout(() => {
      updatePubList(publist.filter((pub) => {
        // console.log("WHAT IS BEING MEASURED: ", searchResult.lat, searchResult.lng, pub.coordinates.latitude, pub.coordinates.longitude)
        // console.log("DISTANCE FROM ZIP: ", measure(searchResult.lat, searchResult.lng, pub.coordinates.latitude, pub.coordinates.longitude))
        // console.log("Zipcode: ", zipCode)
        // console.log("THE REQUEST SENT: ", `https://api.opencagedata.com/geocode/v1/json?key=${process.env.geo_key}&q=${toURI}&pretty=1`)
        if (measure(searchResult.lat, searchResult.lng, pub.coordinates.latitude, pub.coordinates.longitude) < radius) {
          return true
        }
      }
      ))
    }, 10);

  }
  // console.log(searchResult[0], searchResult[1] ,pub.coordinates.latitude,pub.coordinates.longitude )
  // return 



  function checkForImage(pub) {
    if (pub.imageUrl === '') {
      return 'https://images.unsplash.com/photo-1586993451228-09818021e309?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
    }
    return pub.imageUrl
  }

  // ! Function to check when user changes location but not to send until Enter is hit or button is pressed 
  // ! Props will need to be passed through from home page
  // function checkEnter(event) {
  //   const key = event.keyCode
  //   if (key === 13) {
  //     if (event.target.vaue === '') {
  //       props.updateLocation()
  //     } else {
  //       props.updateLocation(event.taget.value)
  //     }
  //   }
  // }
  // ! Add to input:
  // onKeyDown={event => checkEnter(event)}


  function filterPubs(pubsList) {
    let filteredReview
    let filteredPubsA
    let filteredPubsB
    let filteredPubsC
    let filteredPubsD
    let filteredPubsE

    const filters = [takeAwayTog, outdoorSeatingTog, heatingTog, liveMusicTog, liveSportTog]

    filteredReview = pubsList.filter(pub => {
      return pub.reviewed === true
    })

    if (filters[0] === false) {
      filteredPubsA = filteredReview
    } else {
      filteredPubsA = filteredReview.filter(pub => {
        return pub.takeAway === true
      })
    }
    if (filters[1] === false) {
      filteredPubsB = filteredPubsA
    } else {
      filteredPubsB = filteredPubsA.filter(pub => {
        return pub.outdoorSeating === true
      })
    }
    if (filters[2] === false) {
      filteredPubsC = filteredPubsB
    } else {
      filteredPubsC = filteredPubsB.filter(pub => {
        return pub.heating === true
      })
    }
    if (filters[3] === false) {
      filteredPubsD = filteredPubsC
    } else {
      filteredPubsD = filteredPubsC.filter(pub => {
        return pub.liveMusic === true
      })
    }
    if (filters[4] === false) {
      filteredPubsE = filteredPubsD
    } else {
      filteredPubsE = filteredPubsD.filter(pub => {
        return pub.liveSport === true
      })
    }
    return filteredPubsE
  }


  useEffect(() => {
    axios.get('/api/pub')
      .then(resp => {
        updatePubList(resp.data)
        DistanceCall(resp.data)
        CopyPubList(resp.data)
      })
    shouldReset(false)
  }, [resetFilter])

  if (pubsList === undefined) {
    return <>
      <div className="flex-loader">
        <Loader />
      </div>
    </>
  }

  function resetSearch() {
    updatePubList(PubListCopy)

  }

  return <>
    <div className="pubs-page">
      <div className="filter">
        <div className="search" style={{ display: 'flex', justifyContent: 'center' }}>
          <form className="ListForm"
            onSubmit={(e) => {
              e.preventDefault()
              // console.log(zipCode)
              // resetSearch()


              filterPubByDistance(pubsList)

            }}>
            <input className="input" placeholder="Zip" type="text" onChange={(e) => {

              setZipCode(e.target.value.replace(/\s/g, ''))
            }}
            ></input>
            <label>{radius}km</label>
            <input type='range' className='custom-rangePub' min='1' max='20' defaultValue='10' step='0.05' onChange={(e) => {

              setRadius(e.target.value)

            }}></input>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'center' }}>
              <button className="button" style={{marginRight: "2.5px"}}  onClick={() => {
                filterPubByDistance(pubsList)
              }}>Search</button>
              <button className="button"  style={{marginLeft: "2.5px"}} onClick={() => {
                shouldReset(true)

              }}>Clear Filter</button>
            </div>
          </form>
        </div>
        <div className="toggles" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '1%', marginBottom: "2%" }}>
          <div style={{ backgroundColor: 'gray', color: 'whitesmoke', display: 'flex', fontWeight: '700', alignContent: 'center', padding: '5px', border: '5px solid gray', borderRadius: '5px', marginLeft: '7px' }}>
            <Toggle id="take-away-toggle" className="react-toggle" defaultChecked={false} onChange={(event) => updateTakeAwayTog(event.target.checked)} />
            <label htmlFor="take-away-toggle">Take Away</label>
          </div>
          <div style={{ backgroundColor: 'gray', color: 'whitesmoke', display: 'flex', fontWeight: '700', alignContent: 'center', padding: '5px', border: '5px solid gray', borderRadius: '5px', marginLeft: '7px' }}>
            <Toggle id="outdoor-seating-toggle" className="react-toggle" defaultChecked={false} onChange={(event) => updateOutdoorSeatingTog(event.target.checked)} />
            <label htmlFor="outdoor-seating-toggle">Outdoor Seating</label>
          </div>
          <div style={{ backgroundColor: 'gray', color: 'whitesmoke', display: 'flex', fontWeight: '700', alignContent: 'center', padding: '5px', border: '5px solid gray', borderRadius: '5px', marginLeft: '7px' }}>
            <Toggle id="heating-toggle" className="react-toggle" defaultChecked={false} onChange={(event) => updateHeatingTog(event.target.checked)} />
            <label htmlFor="heating-toggle">Heating</label>
          </div>
          <div style={{ backgroundColor: 'gray', color: 'whitesmoke', display: 'flex', fontWeight: '700', alignContent: 'center', padding: '5px', border: '5px solid gray', borderRadius: '5px', marginLeft: '7px' }}>
            <Toggle id="live-music-toggle" className="react-toggle" defaultChecked={false} onChange={(event) => updateLiveMusicTog(event.target.checked)} />
            <label htmlFor="live-music-toggle">Live Music</label>
          </div>
          <div style={{ backgroundColor: 'gray', color: 'whitesmoke', display: 'flex', fontWeight: '700', alignContent: 'center', padding: '5px', border: '5px solid gray', borderRadius: '5px', marginLeft: '7px' }}>
            <Toggle id="live-sport-toggle" className="react-toggle" defaultChecked={false} onChange={(event) => updateLiveSportTog(event.target.checked)} />
            <label htmlFor="live-sport-toggle">Live Sport</label>
          </div>
        </div>
      </div>
      <div className="search-results">
        <div className="columns is-multiline is-mobile" style={{ display: 'flex', justifyContent: 'center' }}>
          {filterPubs(pubsList).map((pub, index) => {
            return <div className="column is-2-desktop is-6-tablet is-12-mobile" key={index}>
              <Link to={`pubs/${pub._id}`}>
                <div className="card">
                  <div className="card-image">
                    <figure className="image is-square">
                      <img src={checkForImage(pub)} alt={pub.name} />
                    </figure>
                  </div>
                  <div className="card-content">
                    <div className="media-content">
                      <h2 className="title is-5">{pub.name}</h2>
                      <p className="subtitle is-6">{pub.address.address1}, {pub.address.zip_code}</p>
                      <p className="subtitle is-6">Distance to: {Math.round((measure(searchResult.lat, searchResult.lng, pub.coordinates.latitude, pub.coordinates.longitude) + Number.EPSILON) * 100) / 100} Km  </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          })}
        </div>
      </div>
    </div>
  </>

}

export default PubList