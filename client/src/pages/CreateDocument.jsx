import React, { useState,useEffect,useContext } from 'react';
import { Form, Button, Row, Col, Modal, ListGroup, InputGroup, Table, FormControl } from 'react-bootstrap';
import { useNavigate, useParams} from 'react-router-dom'
import { PiMapPinSimpleAreaFill, PiPen, PiNotePencilThin, PiArrowRight } from "react-icons/pi";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AuthContext } from '../layouts/AuthContext';
import MapPointSelector from '../components/MapPointSelector'
import RelatedDocumentsSelector from '../components/RelatedDocumentsSelector';
import API from '../services/API.mjs';
import Document from '../mocks/Document.mjs';
import { dmsToDecimal } from '../utils/convertToDecimal';
import '../style/CreateDocument.css'
import Select from 'react-select'
import { showSuccess, showError } from '../utils/notifications';
import CreatableSelect from 'react-select/creatable'

function FormDocument(props) {

  dayjs.extend(customParseFormat);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [docID,setDocID] = useState(props.mode==='view' ? id : '');
  const [title,setTitle] = useState('');
  const [stakeholder,setStakeholder] = useState([]);
  const [scale,setScale] = useState(null);
  const [issuanceDate,setIssuanceDate] = useState('');
  const [type,setType] = useState(null);
  const [language,setLanguage] = useState('');
  const [description,setDescription] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [loading,setLoading] = useState(true);
  const [isLoadingStake,setIsLoadingStake] = useState(false);
  const [isLoadingType,setIsLoadingType] = useState(false);
  const [isLoadingScale,setIsLoadingScale] = useState(false);
  const [day,setDay] = useState('')
  const [month,setMonth] = useState('')
  const [year,setYear] = useState('')
  const [edit,setEdit] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isWholeMunicipal, setIsWholeMunicipal] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]); 
  const [selectedDocuments, setSelectedDocuments] = useState([]); 
  const [relatedDocuments, setRelatedDocuments] = useState([]); 
  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState([]);
  const [allTypes,setAllTypes] = useState([]);
  const [allStake,setAllStake] = useState([]);
  const [allScale,setAllScale] = useState([]);
  const [errors, setErrors] = useState([]);
  const [rights, setRights] = useState(false)

  const customStyles = {
    control: (base) => ({
      ...base,
      fontFamily: 'Open Sans',                  // Font
      fontSize: '24px',                          // Dimensione del font
      color: 'var(--demo-black)',                // Colore del testo
      maxWidth: '505px',                         // Larghezza massima
      width: '100%',                             // Larghezza dinamica
      height: '51px',                            // Altezza del campo
      paddingLeft: '20px',                       // Padding sinistro
      backgroundColor: 'var(--lily-white)',      // Colore di sfondo
      border: 'none',                            // Nessun bordo
      borderRadius: '0',                         // Nessun arrotondamento
      boxShadow: 'none',                         // Nessuna ombra
    }),
    placeholder: (base) => ({
      ...base,
      fontFamily: 'Open Sans',
      fontSize: '24px',
      color: 'var(--demo-black)',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--demo-black)',               // Colore del testo selezionato
    }),
    menu: (base) => ({
      ...base,
      fontFamily: 'Open Sans',
      fontSize: '24px',
      color: 'var(--demo-black)',
      backgroundColor: 'var(--lily-white)',
      borderRadius: '0',                        // Bordo del menu
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#e9ecef' : 'var(--lily-white)', // Colore di sfondo quando selezionata o no
      color: 'var(--demo-black)',
      '&:active': {
        backgroundColor: '#e9ecef',
      },
    }),
  };

  const allLanguage = [{ value: 'Italian', label: 'Italian' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'English', label: 'English' }]

  useEffect(() => {
    if (props.mode === 'view') {
      setDocID(id); // Update docID whenever id changes
    }
  }, [id, props.mode]); // Only run when `id` or `props.mode` changes

  useEffect(()=>{
    const loadData = async () => {
      try {
        const [types, documents, stake, sca] = await Promise.all([API.getTypes(), API.getDocuments(), API.getStake(), API.getScale()]);
        console.log(types)
        console.log(documents)
        console.log(stake)
        console.log(sca)
        setAllTypes(types);
        setAllStake(stake);
        setAllScale(sca);
        const filteredDocuments = props.mode === 'view' ? documents.filter(doc => doc.id !== id) : documents;
        setAllDocuments(filteredDocuments);

        if (props.mode === 'view') {
          if(user){
            if(user.role==='Urban Planner')
              setRights(true)
          }
          const doc = await API.getData(docID);
          const connectedDocumentIds = doc.connections.map(doc => doc.id);
          setTitle(doc.title);
          const st = [];
          doc.stakeholders.forEach((s) => st.push({value:s, label:s}))
          setStakeholder(st);
          setScale(doc.scale);
          setDescription(doc.description);
          const ty = {value:doc.type, label:doc.type}
          setType(ty);
          const lan = {value:doc.language, label:doc.language}
          setLanguage(lan);
          if(doc.coordinates.lat === 0 && doc.coordinates.lng === 0 )
            setIsWholeMunicipal(true)
          else setCoordinates(doc.coordinates);
          const [dd, mm, yyyy] = doc.issuanceDate.split("-");
          if(dd!='00')
            setDay(dd)
          if(mm!='00')
            setMonth(mm)
          setYear(yyyy)
          setRelatedDocuments(doc.connections);
          setSelectedDocuments(connectedDocumentIds)
          
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [props.mode, docID, id]);

  const areCoordinatesValid = (coordinates) => {
    const kirunaBounds = [
    [67.765, 20.090],
    [67.900, 20.420]
  ];

  // Extract bounds
  const [sw, ne] = kirunaBounds; // southwest and northeast corners
  const isValidLat = coordinates.lat >= sw[0] && coordinates.lat <= ne[0];
  const isValidLng = coordinates.lng >= sw[1] && coordinates.lng <= ne[1];

  // Validate coordinates are numbers and within bounds
  return (
    /^-?\d*\.?\d*$/.test(coordinates.lat) &&
    /^-?\d*\.?\d*$/.test(coordinates.lng) &&
    isValidLat &&
    isValidLng
  );
  };
  const handleDMSConversion = (coordinates, setCoordinates, setErrors) => {
    try {
      const decimalCoordinate = dmsToDecimal(`${coordinates.lat} ${coordinates.lng}`);
      setCoordinates(decimalCoordinate);
      setErrors([]);
    } catch (error) {
      setErrors({ coordinates: 'Not correct format' });
      setCoordinates({ lat: '', lng: '' });
    }
  };
  const toggleMap = () => {
    if (areCoordinatesValid(coordinates) || coordinates === '') {
      setShowMap(prev => !prev);
      setIsWholeMunicipal(false)
    } else {
      handleDMSConversion(coordinates, setCoordinates, setErrors);
      setShowMap(prev => !prev);
      setIsWholeMunicipal(false)
    }
  };
  const handleCoordinatesChange = (newCoordinates) => {
    setErrors([]);
    setCoordinates(newCoordinates)
    setIsWholeMunicipal(false)
  };
  const handleDMSChange = () => {
    if (areCoordinatesValid(coordinates) || coordinates === '') {
      setErrors([]);
    } else {
      handleDMSConversion(coordinates, setCoordinates, setErrors);
    }
  };
  const handleSelectWholeMunicipal = () => {
    setIsWholeMunicipal(!isWholeMunicipal)
    setCoordinates({ lat: '', lng: '' });
    setErrors([]);
  };
  const handleRelatedDocumentClick = (relatedDocumentId) => navigate(`/document/view/${relatedDocumentId}`);

  const validateForm = () => {
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title cannot be empty!';
    if (stakeholder.length === 0) validationErrors.stakeholder = 'Stakeholder cannot be empty!';
    if (scale=== null) validationErrors.scale = 'Scale cannot be empty!';
    if (type === null) validationErrors.type = 'Type cannot be empty!';
    if (!description.trim()) validationErrors.description = 'Description cannot be empty!';
    if (!areCoordinatesValid(coordinates) && !isWholeMunicipal) validationErrors.coordinates = 'Not correct format or not inside Kiruna area';
    if(day && (!month && !year)) validationErrors.day ='Insert month and year before the day'
    if(month && !year) validationErrors.month ='Insert year before the day'
    //if(!isWholeMunicipal && (!coordinates.lat || !coordinates.lng)) validationErrors.coordinates = 'Coordinates cannot be empty!';
    console.log(validationErrors);
    return validationErrors;
  };



  const handleSubmit = (event) =>{
    event.preventDefault();
    const validationErrors = validateForm();
    
    if(Object.keys(validationErrors).length>0){
      console.log("Form not submitted"); // Debugging
      setErrors(validationErrors);
      return;
    }
    if(isWholeMunicipal) {coordinates.lat = 0; coordinates.lng = 0}
    setErrors([]);
    const st=[];
    stakeholder.forEach((s) =>st.push(s.value))
    if(!day){
      if(!month){
        setIssuanceDate(`00-00-${year}`)
      }else{
        setIssuanceDate(`00-${month}-${year}`)
      }
    }else{
      setIssuanceDate(`${day}-${month}-${year}`)
    }
    
    const doc = new Document(docID, title.trim(), st, scale, issuanceDate, type.value, language.value, description);
    if(props.mode==='add'){
      API.AddDocumentDescription(doc, selectedConnectionTypes, coordinates);
    } else if (props.mode === 'view') {
      API.EditDocumentDescription(doc, selectedConnectionTypes , coordinates, docID );
    }
    showSuccess('Action successful!')
    setTimeout(()=>{
      navigate('/documents');
    }, 2000)
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocuments(prevSelected =>
      prevSelected.includes(documentId)
        ? prevSelected.filter(id => id !== documentId)
        : [...prevSelected, documentId]
    );
  };

  const handleSelectStakeChange = (selectedOptions) => {
    
    setStakeholder(selectedOptions);
  };

  const handleSelectTypeChange = (selectedOption) => {
    setType(selectedOption);
  };

  const handleSelectLanguageChange = (selectedOption) => {
    setLanguage(selectedOption);
  };

  const handleSelectScaleChange = (selectedOption) => {
    setScale(selectedOption);
  };
  
  const handleConnectionTypeSelect = (documentId, selectedConnectionType) => {
    setSelectedConnectionTypes(prevSelected => {
      // Verifica se il documento è già presente nella lista
      const existingDocIndex = prevSelected.findIndex(item => item.id === documentId);
      
      if (existingDocIndex !== -1) {
        // Se il documento è già selezionato, aggiorna il tipo di connessione
        const updatedSelected = [...prevSelected];
        updatedSelected[existingDocIndex] = { id: documentId, type: selectedConnectionType };
        return updatedSelected;
      } else {
        // Se il documento non è nella lista, aggiungilo
        return [...prevSelected, { id: documentId, type: selectedConnectionType }];
      }
    });
  };
  
  const handleEditChange=()=>{
    setEdit(true);
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  const handleCreateStake = (inputValue) => {
    setIsLoadingStake(true);
    setTimeout(() => {
      const newOption = createOption(inputValue);
      API.addStakeholder(inputValue);
      setIsLoadingStake(false);
      setAllStake((prev) => [prev, newOption]);
      setStakeholder((prev) => [...prev, newOption]);
    }, 1000);
  };

  const handleCreateType = (inputValue) => {
    setIsLoadingType(true);
    setTimeout(() => {
      const newOption = createOption(inputValue);
      API.addType(inputValue);
      setIsLoadingType(false);
      setAllTypes((prev) => [...prev, newOption]);
      setType(newOption);
    }, 1000);
  };

  const handleCreateScale = (inputValue) => {
    setIsLoadingScale(true);
    setTimeout(() => {
      const newOption = createOption(inputValue);
      API.addScale(inputValue);
      setIsLoadingScale(false);
      setAllScale((prev) => [...prev, newOption]);
      setScale(newOption);
    }, 1000);
  };

  return  (
    <div className="wrapper">
      <div className="form-container">
        <h2 className='form-container-title'>
          {props.mode==='view' ? title : 'New Document'}
          {(props.mode==='view' && edit===false && rights) && <PiNotePencilThin className='edit-button' onClick={() => handleEditChange() }/>}
          </h2>
        <Form onSubmit={handleSubmit} data-testid="form-component">
          <Row>
            <Col className='col-form'>
              <Form.Group className='form-group'  controlId="title">
                <Form.Label>Title{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                <Form.Control type="text" placeholder="Enter title" minLength={2} value={title} onChange={(event) => setTitle(event.target.value)}  isInvalid={!!errors.title} readOnly={!edit && props.mode!='add'}/>
                <Form.Control.Feedback type="invalid">
                    {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className='form-group' controlId="stakeholder">
                <Form.Label>
                  Stakeholder{(props.mode === 'add' || edit) && <span>*</span>}
                </Form.Label>
                {!loading && <CreatableSelect
                  classNamePrefix="react-select"
                  styles={customStyles}
                  isMulti
                  isLoading={isLoadingStake}
                  options={allStake} // Dati da mostrare nel dropdown
                  value={stakeholder} // Valori selezionati
                  onCreateOption={handleCreateStake}
                  onChange={handleSelectStakeChange} // Funzione per aggiornare lo stato
                  getOptionLabel={(e) => e.label} // Personalizza l'etichetta dell'opzione
                  getOptionValue={(e) => e.value} // Personalizza il valore dell'opzione
                  placeholder="Select one or more stakeholders"
                  isDisabled={!edit && props.mode !== 'add'}
                >
                </CreatableSelect>
                }
                {errors.stakeholder && (
                  <div className="invalid-feedback" style={{ display: "block" }}>
                    {errors.stakeholder}
                  </div>
                  )}
              </Form.Group>
              
              <Form.Group className='form-group'  controlId="scale">
                <Form.Label>Scale{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                {!loading && <CreatableSelect
                  classNamePrefix="react-select"
                  styles={customStyles}
                  isLoading={isLoadingScale}
                  onCreateOption={handleCreateScale}
                  options={allScale} // Dati da mostrare nel dropdown
                  value={scale} // Valori selezionati
                  onChange={handleSelectScaleChange} // Funzione per aggiornare lo stato
                  getOptionLabel={(e) => e.label} // Personalizza l'etichetta dell'opzione
                  getOptionValue={(e) => e.value} // Personalizza il valore dell'opzione
                  placeholder="Select scale"
                  isDisabled={!edit && props.mode !== 'add'}
                >
                </CreatableSelect>}
                {errors.scale && (
                  <div className="invalid-feedback" style={{ display: "block" }}>
                    {errors.scale}
                  </div>
                  )}
              </Form.Group>

              <Form.Group className='form-group'  controlId="issuanceDate">
                <Form.Label>Issuance Date{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                <Row>
                    <Col xs={3}>
                      <Form.Control type="text" placeholder="DD" value={day} onChange={(event) => setDay(event.target.value)}  isInvalid={!!errors.day} readOnly={!edit && props.mode!='add'}/>
                      <Form.Control.Feedback type="invalid">
                        {errors.day}
                      </Form.Control.Feedback>
                    </Col>
                    <Col xs={3}>
                      <Form.Control type="text" placeholder="MM" value={month} onChange={(event) => setMonth(event.target.value)}  isInvalid={!!errors.month} readOnly={!edit && props.mode!='add'}/>
                      <Form.Control.Feedback type="invalid">
                        {errors.month}
                      </Form.Control.Feedback>
                    </Col>
                    <Col xs={4}>
                      <Form.Control type="text" placeholder="YYYY" value={year} onChange={(event) => setYear(event.target.value)}  isInvalid={!!errors.year} readOnly={!edit && props.mode!='add'}/>
                    </Col>
                </Row>
              </Form.Group>

              <Form.Group className='form-group' controlId="type">
                <Form.Label>Type{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                {!loading && <CreatableSelect
                  classNamePrefix="react-select"
                  styles={customStyles}
                  isLoading={isLoadingType}
                  onCreateOption={handleCreateType}
                  options={allTypes} // Dati da mostrare nel dropdown
                  value={type} // Valori selezionati
                  onChange={handleSelectTypeChange} // Funzione per aggiornare lo stato
                  getOptionLabel={(e) => e.label} // Personalizza l'etichetta dell'opzione
                  getOptionValue={(e) => e.value} // Personalizza il valore dell'opzione
                  placeholder="Select type"
                  isDisabled={!edit && props.mode !== 'add'}
                >
                </CreatableSelect>}
                {errors.type && (
                  <div className="invalid-feedback" style={{ display: "block" }}>
                    {errors.type}
                  </div>
                  )}
              </Form.Group>

              <Form.Group className='form-group' controlId="language">
                <Form.Label>Language{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  styles={customStyles}
                  options={allLanguage} // Dati da mostrare nel dropdown
                  value={language} // Valori selezionati
                  onChange={handleSelectLanguageChange} // Funzione per aggiornare lo stato
                  getOptionLabel={(e) => e.label} // Personalizza l'etichetta dell'opzione
                  getOptionValue={(e) => e.value} // Personalizza il valore dell'opzione
                  placeholder="Select language"
                  isDisabled={!edit && props.mode !== 'add'}
                >
                </Select>
              </Form.Group>
            </Col>

            <Col className='col-form'>
              <Form.Group  className='form-group' controlId="description">
                <Form.Label>Description{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                <Form.Control as="textarea" placeholder="Enter description" value={description} onChange={(event) => setDescription(event.target.value)}  isInvalid={!!errors.description} readOnly={!edit && props.mode!='add'}     className={!edit && props.mode === 'view' ? 'scrollable-description' : ''}
                />
              </Form.Group>
              <Form.Control.Feedback type="invalid">
                    {errors.description}
              </Form.Control.Feedback>
            </Col>
          </Row>
          <Row>
            <Row>
              <Col md={4}>
                <Form.Group  className='form-group' controlId="description">
                  <Form.Label>Coordinates{(props.mode === 'add' || edit) && <span>*</span>}</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="latitude (e.g., 67.8558)" 
                    minLength={2} 
                    value={coordinates.lat} 
                    onChange={(event) => handleCoordinatesChange({lat:event.target.value, lng:coordinates.lng})}
                    //isInvalid={!!errors.coordinates} 
                    readOnly={(!edit && props.mode !=='add') || showMap}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.coordinates}
                  </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group  className='form-group margin-top-3' controlId="description">
                    <Form.Control 
                      type="text" 
                      placeholder="longitude (e.g., 20.2253)" 
                      minLength={2} 
                      value={coordinates.lng} 
                      onChange={(event) => handleCoordinatesChange({lat: coordinates.lat, lng:event.target.value})}
                      isInvalid={!!errors.coordinates} 
                      readOnly={(!edit && props.mode !== 'add' )|| showMap}
                      />
                  </Form.Group>
                </Col>
                <Col md={3}>
                {(props.mode === 'add' || edit) && (
                  <div className='convert-btn  margin-top-3' onClick={handleDMSChange}>
                    <PiArrowRight />
                    convert DMS format</div>  
                )}
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                {(props.mode === 'add' || edit || isWholeMunicipal) && (
                  <div className="map-view-trigger">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check 
                        type="checkbox" 
                        label="Select the whole municipal" 
                        disabled={!(props.mode === 'add' || edit)}
                        checked={isWholeMunicipal} 
                        onChange={handleSelectWholeMunicipal} 
                      />
                    </Form.Group>
                  </div>
                  )}
                </Col>
                <Col md={3}>
                {(props.mode === 'add' || edit) && (
                  <div className="map-view-trigger" onClick={toggleMap}>
                    {showMap ? (<PiPen />) : (<PiMapPinSimpleAreaFill />)}
                    <span>{showMap ? 'Type coordinates' : 'Select on map'}</span>
                  </div>
                )}
                </Col>
              </Row>
            {(showMap || (props.mode !== 'add' && !edit && !isWholeMunicipal)) && <MapPointSelector 
              coordinates={coordinates}
              mode={props.mode}
              edit={edit}
              onCoordinatesChange={handleCoordinatesChange} 
            />}
          </Row>
          <Row className='mt-6'>
            <Row>
              <Col md={4}>
                <Form.Group  className='form-group' controlId="description">
                  <Form.Label>{(props.mode === 'add' || edit) ? 'Connect to the documents' : 'Connections'}</Form.Label>
                  </Form.Group>
                </Col>
            </Row>
            {!loading && <RelatedDocumentsSelector 
              mode={props.mode}
              edit={edit}
              allDocuments={(props.mode === 'add' || edit) ? allDocuments : relatedDocuments}
              relatedDocuments={relatedDocuments}
              selectedDocuments={selectedDocuments}
              selectedConnectionTypes={selectedConnectionTypes}
              onDocumentSelect={handleDocumentSelect}
              onRelatedDocumentClick={handleRelatedDocumentClick}
              onConnectionTypeChange={handleConnectionTypeSelect}
              setSelectedConnectionTypes={setSelectedConnectionTypes}
            />}
          </Row>
          {(props.mode === 'add' || edit) && (
            <Row className="justify-content-end">
              <Button 
                className="save-button" 
                type="submit" 
                data-testid={props.mode === 'add' ? 'add' : undefined}
              >
                {'Save'}
              </Button>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
}


export default FormDocument;