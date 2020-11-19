import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import moment from 'moment'
import Modal from 'react-modal'
import Icon from '@mdi/react'
import { mdiFlagVariant } from '@mdi/js'
import { Slide } from 'react-slideshow-image'
import { Link } from 'react-router-dom'
import ReactMapGL, { Marker, Popup, GeolocateControl, Layer, Source } from 'react-map-gl'


import Loader from './Loader'
import { getUserId, isAdmin, isCreator, isLandlord, isUser, isVerified } from '../lib/auth'
import WeatherIcons from './WeatherIcons'

const singlePub = (props) => {

  const [singlePub, updateSinglePub] = useState([])
  const [subscribed, updateSubscribed] = useState(false)
  const [text, setText] = useState('')
  const [user, updateUser] = useState({})

  const [latLong, updateLatLong] = useState([])
  const [weatherInfo, updateWeatherInfo] = useState({})

  const id = props.match.params.id
  const token = localStorage.getItem('token')

  const [viewport, setViewport] = useState({
    latitude: latLong[0],
    longitude: latLong[1],
    width: '500px',
    height: '500px',
    zoom: 12
  })
  const mapRef = useRef()

  useEffect(() => {
    setViewport({
      latitude: latLong[0],
      longitude: latLong[1],
      width: '500px',
      height: '500px',
      zoom: 12
    })

  }, [latLong])


  const handleViewportChange = useCallback(
    (newViewport) => {
      setViewport(newViewport)
    },
    []
  )


  useEffect(() => {
    axios.get(`/api/users/${getUserId()}`)
      .then(resp => {
        updateUser(resp.data)
      })
  }, [])


  useEffect(() => {
    async function fetchData() {

      const { data } = await axios.get(`/api/pub/${id}`)
      updateSinglePub(data)
      console.log(data)


      const { data: geoData } = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${data.address.zip_code}&key=${process.env.geo_key}`)
      updateLatLong([geoData.results[0].geometry.lat, geoData.results[0].geometry.lng])


      const { data: weatherData } = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${geoData.results[0].geometry.lat}&lon=${geoData.results[0].geometry.lng}&exclude=minutely,alerts&units=metric&appid=${process.env.weatherApiKey}`)
      updateWeatherInfo(weatherData)
    }

    fetchData()
  }, [])


  function findInfo(array) {
    const pubInfo = []

    if (array.takeAway === true) {
      pubInfo.push('Take Away')
    }
    if (array.outdoorSeating === true) {
      pubInfo.push('Outdoor Seating')
    }
    if (array.heating === true) {
      pubInfo.push('Heating')
    }
    if (array.liveMusic === true) {
      pubInfo.push('Live Music')
    }
    if (array.liveSport === true) {
      pubInfo.push('Live Sport')
    }
    return pubInfo
  }

  function handleComment() {
    if (text === '') {
      return
    } else {
      axios.post(`/api/pub/${id}/comments`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(resp => {
          setText('')
          updateSinglePub(resp.data)
        })
    }
  }

  function handleFlag(commentId) {
    axios.get(`/api/pub/${id}/comments/${commentId}`)
      .then(resp => {
        if (resp.data.flagged === false) {
          axios.put(`/api/pub/${id}/comments/${commentId}`, { flagged: true }, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(resp => {
              updateSinglePub(resp.data)
            })
        } else if (resp.data.flagged === true) {
          axios.put(`/api/pub/${id}/comments/${commentId}`, { flagged: false }, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(resp => {
              updateSinglePub(resp.data)
            })
        }
      })
  }

  function handleCommentDelete(commentId) {
    axios.delete(`/api/pub/${id}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(resp => {
        updateSinglePub(resp.data)
      })
  }


  function countReplies(comment) {
    const replies = comment.replies.length
    if (replies === 0) {
      return 'Be the first to reply'
    } else if (replies === 1) {
      return '1 Reply'
    } else {
      return `${replies} Replies`
    }
  }

  function deletePub() {
    axios.delete(`/api/pub/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        props.history.push('/pubs')
      })
  }

  function approvePub() {
    axios.put(`/api/pub/${id}`, {
      reviewed: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(resp => {
        updateSinglePub(resp.data)
        console.log(resp.data)
      })
      .then(() => {
        props.history.push('/admin')
      })
  }

  function subscribe() {
    updateSubscribed(true)
    axios.post(`/api/pub/${singlePub._id}/subscribers`, '', {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  useEffect(() => {
    if (!user.subscribedPubs) {
      return
    }
    if (user.subscribedPubs.includes(singlePub._id)) {
      updateSubscribed(true)
    }
  }, [user])



  // ! Modal ------------
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      ['text-align']: 'center',
      ['font-size']: '22px'

    },
    overlay: {
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.5)'
    }
  }

  Modal.setAppElement('#root')

  const [editModalIsOpen, setEditIsOpen] = useState(false)
  const [deleteModalIsOpen, setDeleteIsOpen] = useState(false)
  const [approveModalIsOpen, setApproveIsOpen] = useState(false)


  function openEditModal() {
    setEditIsOpen(true)
  }

  function closeEditModal() {
    setEditIsOpen(false)
  }

  function openDeleteModal() {
    setDeleteIsOpen(true)
  }

  function closeDeleteModal() {
    setDeleteIsOpen(false)
  }

  function openApproveModal() {
    setApproveIsOpen(true)
  }

  function closeApproveModal() {
    setApproveIsOpen(false)
  }

  // ! ------------


  function showPhoto() {
    if (singlePub.photos.length === 0 && singlePub.imageUrl === '') {
      return ['https://images.unsplash.com/photo-1586993451228-09818021e309?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80']
    } else if (singlePub.photos.length === 0) {
      return [singlePub.imageUrl]
    } else {
      return singlePub.photos
    }
  }


  if (singlePub.address === undefined || weatherInfo.daily === undefined) {
    return <>
      <div className="flex-loader">
        <Loader />
      </div>
    </>
  }


  return <>
    <div className="single-page">
      <div className="single-left-side">
        <div className="name">
          <h1 style={{ fontFamily: 'Playfair Display SC, serif' }}>{singlePub.name}</h1>
        </div>
        <div className="address-info-times">
          <div className="address">
            <h3 style={{ fontWeight: 'bold' }}>{singlePub.address.address1}</h3>
            <h3 style={{ fontWeight: 'bold' }}>{singlePub.address.city}</h3>
            <h3 style={{ fontWeight: 'bold' }}>{singlePub.address.zip_code}</h3>
            <br></br>
            <h3 style={{ fontWeight: 'bold' }}>{singlePub.phoneNumber}</h3>
          </div>

          <ul className="info">
            {findInfo(singlePub).map((item, index) => {
              return <li key={index}>{item}</li>
            })}
          </ul>

          <div className="opening-times">
            <div className="times">Opening Times</div>
            <div className="monday">Mon: {singlePub.openingHours}</div>
            <div className="tuesday">Tues: {singlePub.openingHours}</div>
            <div className="wednesday">Wed: {singlePub.openingHours}</div>
            <div className="thursday">Thurs: {singlePub.openingHours}</div>
            <div className="friday">Fri: {singlePub.openingHours}</div>
            <div className="saturday">Sat: {singlePub.openingHours}</div>
            <div className="sunday">Sun: {singlePub.openingHours}</div>
          </div>
        </div>
        <div className="description">
          <p>{singlePub.description}</p>
        </div>
        <div className="weather">
          {weatherInfo.daily.map((day, index) => {
            return <section className="future-weather-day" key={index}>
              <h3 className="weather-date">{moment.unix(day.dt).format('dddd Do MMM')}</h3>
              <img src={WeatherIcons[day.weather[0].description][0]} />
              <p>Temp: {Math.round(day.temp.min * 10) / 10}°C - {Math.round(day.temp.max * 10) / 10}°C</p>
              <p>W/S: {Math.round(day.wind_speed * 22.3694) / 10} mph</p>

            </section>
          })}
        </div>
        <div className="edit-delete-buttons">


          {isCreator(singlePub.user, user) && <button className="edit-pub button is-black" style={{ border: '3px solid white' }} onClick={openEditModal}>Edit Pub</button>}
          <Modal isOpen={editModalIsOpen} onRequestClose={closeEditModal} style={customStyles} contentLabel="Edit Modal">
            <p>Are you sure you want to make changes to this pub?</p>
            <div className="modal-buttons">
              <button className="button is-black" style={{ border: '3px solid white', margin: '20px' }} onClick={closeEditModal}>cancel</button>
              <Link to={`/pubs/${id}/edit-pub`}><button className="button is-black" style={{ border: '3px solid white', margin: '20px' }} >confirm</button></Link>
            </div>
          </Modal>



          {isCreator(singlePub.user, user) && <button className="delete-pub button is-danger" style={{ border: '3px solid white' }} onClick={openDeleteModal}>Delete Pub</button>}
          <Modal isOpen={deleteModalIsOpen} onRequestClose={closeDeleteModal} style={customStyles} contentLabel="Delete Modal">
            <p>Are you sure you want to delete this pub?</p>
            <div className="modal-buttons">
              <button className="button is-black" style={{ border: '3px solid white', margin: '20px' }} onClick={closeDeleteModal}>cancel</button>
              <button className="button is-danger" style={{ border: '3px solid white', margin: '20px' }} onClick={deletePub}>confirm</button>
            </div>
          </Modal>

          {isCreator(singlePub.user, user) &&
            <Link to={`/email/send/${singlePub._id}`}><button className="sendEmail-pub button is-black" style={{ border: '3px solid white' }} >Send A Note</button></Link>}

          {(isAdmin(user) && singlePub.reviewed === false) && <button className="approve-pub button is-black" style={{ border: '3px solid white' }} onClick={openApproveModal}>Approve Pub</button>}
          <Modal isOpen={approveModalIsOpen} onRequestClose={closeApproveModal} style={customStyles} contentLabel="Approve Modal">
            <p>Are you sure you want to approve this pub?</p>
            <div className="modal-buttons">
              <button className="button is-black" style={{ border: '3px solid white', margin: '20px' }} onClick={closeApproveModal}>cancel</button>
              <button className="button is-black" style={{ border: '3px solid white', margin: '20px' }} onClick={approvePub}>confirm</button>
            </div>
          </Modal>




        </div>
      </div>
      <div className="single-middle">
        <div className="slide-show">
          <Slide easing="ease">
            {showPhoto().map((photo, index) => {
              return <div className="each-slide" key={index}>
                <div style={{ 'backgroundImage': `url(${photo})` }}>
                </div>
              </div>
            })}
          </Slide>
        </div>
        <div className="single-map">
          <ReactMapGL className="mapgl"
            ref={mapRef}
            {...viewport}
            mapStyle='mapbox://styles/adwam12/ckhewfl88137g19rzckkwjfv0'
            mapboxApiAccessToken={process.env.mapbox_key}
            onViewportChange={handleViewportChange}
          >
            <Marker
              latitude={latLong[0]}
              longitude={latLong[1]}

            >
              <img src='https://img.icons8.com/cotton/2x/beer-glass.png' style={{ height: '45px' }} className='BeerIcon' />
            </Marker>
          </ReactMapGL>
        </div>
      </div>
      <div className="single-right-side">
        <div className="sub-button">
          {!subscribed && isVerified(user) ? <button className="button is-black" style={{ border: '3px solid white' }} onClick={subscribe} >Subscribe</button> : null}
        </div>
        <div className="comments-section">
          <article className="media">
            {((!token || !isVerified(user)) && singlePub.comments.length === 0) && <div style={{ margin: 'auto' }} className="no-comments">No Comments</div>}
            {(token && isVerified(user)) && <div className="media-content">

              <div className="field">
                <p className="control">
                  <textarea className="textarea" placeholder="Post a comment..." onChange={event => setText(event.target.value)} value={text}>{text}</textarea>
                </p>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-black" style={{ border: '3px solid white' }} onClick={handleComment}>Post</button>
                </p>
              </div>
            </div>}
          </article>
          {singlePub.comments && singlePub.comments.map(comment => {
            return <article key={comment._id} className="media">
              <div className="media-content">
                <div className="content">
                  <div className="user-time">
                    <p className="username">
                      {!comment.user ? 'unknown' : comment.user.username}
                    </p>
                    <p style={{ fontWeight: 'normal' }}>
                      ({moment(comment.createdAt).fromNow()})
                    </p>
                  </div>
                  <p>{comment.text}</p>
                  <div>
                    <Link style={{ fontWeight: 'normal' }} to={`/pubs/${id}/comments/${comment._id}`}>{countReplies(comment)}</Link>
                  </div>
                </div>
              </div>
              <div className="media-right">
                {isLandlord(user) && <Icon
                  onClick={() => handleFlag(comment._id)}
                  path={mdiFlagVariant}
                  size={1}
                  color={comment.flagged === true ? 'red' : 'grey'}
                />}
                {!comment.user ? false : isCreator(comment.user._id, user) && <button className="delete" onClick={() => handleCommentDelete(comment._id)}>
                </button>}
              </div>
            </article>
          })}
        </div>
      </div>
    </div>


  </>
}
export default singlePub