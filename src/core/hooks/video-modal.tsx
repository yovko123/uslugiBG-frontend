import React from 'react';
import { Modal } from 'react-bootstrap';
import ReactPlayer from 'react-player';


const VideoModal = ({ show, handleClose, videoUrl }:any) => {
  return (
    <Modal className='video-modal' show={show} centered size='xl' onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title></Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ReactPlayer url={videoUrl} playing={true} controls={true} width='100%' height='80vh'/>
    </Modal.Body>
    
  </Modal>
  )
}

export default VideoModal