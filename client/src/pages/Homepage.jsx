import React, { useState, useEffect } from 'react';
import '../style/Homepage.css';
import { useNavigate } from 'react-router-dom';
import Slideshow from '../components/Slideshow';
import { Row } from 'react-bootstrap';
import { PiFilePlus, PiMapTrifold} from 'react-icons/pi';
import { IoLibraryOutline } from "react-icons/io5";

function Homepage(props) {
  const navigate = useNavigate();

  const handleNewDocument = () => {
    navigate(`/documents/add`);
  };
  

  const handleListDocument = () => {
    navigate('/documents')
  }

  return (
    <div className="Homepage">
      <div className="welcome-section">
        <h2>Welcome to</h2>
        <h1>Kiruna</h1>
        <p>Sweden</p>
        <Slideshow></Slideshow>
      </div>
      <main className="main-content">
        <div className="search-section">
          <div class="search-section-title">
            <hr></hr>
            <h2>My Tools & Features</h2>
          </div>
          <Row>
            <button onClick={handleListDocument}> 
              <IoLibraryOutline></IoLibraryOutline>
              <span>List of Documents</span>
            </button>
            {props.logged && 
              <button onClick={handleNewDocument}> 
                <PiFilePlus></PiFilePlus>
                <span>Create a document</span>
              </button>
            }
            <button>
              <PiMapTrifold></PiMapTrifold>
              <span>Explore the map</span>
            </button>
          </Row>
        </div>
      </main>
    </div>
  );
}

export default Homepage;