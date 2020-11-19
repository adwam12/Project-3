import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Modal from 'react-modal'

const EmailSend = (props) => {
  const [singlePub, updateSinglePub] = useState([])
  const [subscribers, updateSubscribers] = useState([])
  const id = props.match.params.id

  useEffect(() => {
    axios.get(`/api/pub/${id}`)
      .then(resp => {
        updateSinglePub(resp.data)
      }, [])

    axios.get(`/api/pub/${id}/subscribers`)
      .then(resp => {
        updateSubscribers(resp.data)
      })
  }, [])

  const [message, updateMessage] = useState({
    from: `FindaPint - ${singlePub.name} <lee@leejburgess.co.uk>`,
    to: `${singlePub.subscribers}`,
    subject: '',
    html: ''
  })

  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value

    const data = {
      ...message,
      [name]: value
    }
    updateMessage(data)
  }

  function sendEmail(event) {

    event.preventDefault()
    const token = localStorage.getItem('token')
    subscribers.map((user) => {
      const msg = {
        from: `FindaPint - ${singlePub.name} <lee@leejburgess.co.uk>`,
        to: `${user.email}`,
        subject: message.subject,
        html: message.subject
      }

      console.log(msg)
      axios.post('/api/email/note/send', msg, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(resp => {
          console.log(resp)

        })

    })
    updateMessage('')
    setVerIsOpen(true)
    return
  }

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



  if (!subscribers[0]) {
    return <div className='container has-text-centered'>
      <h1 className='title has-text-white'>Currently no subscribers</h1>
    </div>
  }

  return <div className='container has-text-centered mt-5 mb-5'>
    <h1 className='title has-text-white'>New note from - {singlePub.name} </h1>

    <Modal isOpen={verModalIsOpen} style={customStyles} contentLabel="Ver Modal">
      <p>Note sent to all subscribers!</p>
      <div className="modal-buttons">
        <Link to={`/pubs/${singlePub._id}`} style={{ border: '3px solid white', margin: '20px', minWidth: '100px' }}><button>ok</button></Link>
      </div>
    </Modal>

    <form onSubmit={sendEmail}>
      <div className='field'>
        <label className='label has-text-white subtitle is-5'>Subject</label>
        <input
          type='text'
          onChange={handleChange}
          value={message.subject}
          name='subject'
          className='input is-large'
        />
      </div>
      <div>
        <label className='label has-text-white subtitle is-5'>Message</label>
        <div>
          <textarea
            type='textarea'
            onChange={handleChange}
            value={message.html}
            name='html'
            className='textarea'
          />
        </div>
      </div>
      <button className='button is-medium mt-3'>Send</button>
    </form>

    <section>
      <div className='container'>
        <h2 className="subtitle is-3 has-text-white has-text-centered mt-5">You are sending to:</h2>
        <div className="columns is-multiline is-mobile">
          {subscribers.map((user, index) => {
            return <div className="column is-2-desktop is-6-tablet is-12-mobile" key={index}>
              <Link to={`/users/${user._id}`}>
                <div className="card">
                  <div className="card-content">
                    <div className="media-content">
                      <h2 className="title is-5 is-1-mobile">{user.username}</h2>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          })}
        </div>
      </div>
    </section>
  </div>
}

export default EmailSend