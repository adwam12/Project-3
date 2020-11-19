import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Modal from 'react-modal'
import Loader from './Loader'

const Signup = (props) => {


  const [progress, updateProgress] = useState(0)
  const [loading, updateLoading] = useState(false)
  const [formData, updateFromData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    isLandlord: false,
    address: '',
    postcode: ''
  })

  const [errors, updateErrors] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    isLandlord: false,
    address: '',
    postcode: ''
  })


  const inputFields = ['username', 'email', 'password', 'passwordConfirmation', 'address', 'postcode']

  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value

    const data = {
      ...formData,
      [name]: value
    }

    const newErrors = {
      ...errors,
      [name]: ''
    }

    updateFromData(data)
    updateErrors(newErrors)
  }

  function handleLandlord(event) {
    const value = event.target.value
    const data = {
      ...formData,
      isLandlord: value
    }
    console.log(data)
    updateFromData(data)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const toURI = encodeURI(formData.address + ' ' + formData.postcode + '' + 'uk')
    const url = `https://api.opencagedata.com/geocode/v1/json?key=${process.env.geo_key}&q=${toURI}&pretty=1`

    axios.get(url)
      .then(resp => {
        const geo = resp.data.results[0].geometry
        const finaldata = {
          ...formData,
          locationCoords: {
            latitude: geo.lat,
            longitude: geo.lng
          },
          isEmailConfirmed: false
        }

        axios.post('api/register', finaldata)
          .then(resp => {
            const message = resp.data
            if (message.errors) {
              updateErrors(resp.data.errors)
              console.log(resp.data.errors)
              return
            }
            const logIn = {
              email: finaldata.email,
              password: finaldata.password
            }
            updateLoading(true)
            axios.post('api/login', logIn)
              .then(resp => {
                const token = resp.data.token
                localStorage.setItem('token', token)
                updateFromData('')
              })
            const id = message._id
            axios.get(`api/email/ver/${message._id}`)
              .then(resp => {
                const data = resp.data
                console.log(data)
                updateLoading(false)
                openVerModal()
              })
          })
      })
  }

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

  const [verModalIsOpen, setVerIsOpen] = useState(false)


  function openVerModal() {
    setVerIsOpen(true)
  }


  function increasePint(field) {
    if (formData[field] !== '') {
      const newProgress = progress + 17
      updateProgress(newProgress)
    } else {
      return 
    }
  }


  console.log(progress)

  return <div>

    <Modal isOpen={verModalIsOpen} style={customStyles} contentLabel="Ver Modal">
      <p>Email verification: please check your email to confirm </p>
      <div className="modal-buttons">
        <Link to={'/'}><button className="button is-black" style={{ border: '3px solid white', margin: '20px', minWidth: '100px' }}>ok</button></Link>
      </div>
    </Modal>


    {loading ? <div className="flex-loader"><Loader /></div>
      : <div className='container'>
        <div className='columns is-centered is-vcentered'>
          <div className="LeftForm">
            <form onSubmit={handleSubmit} className='is-centered'>
              {inputFields.map((field, index) => {
                return <div className='field' key={index}>
                  <label>{field}</label>
                  <div className='control'>
                    <input
                      className="input is-small"
                      type={field === 'password' || field === 'passwordConfirmation' ? 'password' : 'text'}
                      onChange={handleChange}
                      onBlur={() => increasePint(field)}
                      value={formData[field]}
                      name={field}
                    />
                    {errors[field] && <p style={{ color: 'red' }}>
                      {`Incorrect ${errors[field].path}`}</p>}
                  </div>


                </div>
              })}
              <div className='field'>
                <label>
                  Are you a Landlord?
                </label>
              </div>
              <div className='control'>
                <div className='select'>
                  <select name="isLandlord" onChange={handleLandlord} defaultValue={false}>
                    <option value={false}>false</option>
                    <option value={true}>true</option>
                  </select>
                </div>
              </div>
              <div className='control'>
                <button className='button mt-2'>submit</button>
              </div>

            </form>
          </div>
          <div className='MasterContainer'>
            <div className='pint-holder'>
              <div className='pint'>
                <progress value={progress} max="100">100%</progress>
              </div>
            </div>
          </div>
        </div>
      </div>}


  </div>
}

export default Signup