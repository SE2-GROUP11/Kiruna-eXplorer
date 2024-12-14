import React, { useState, useEffect } from "react";
import { ListGroup, Row, Col, Form, Button } from "react-bootstrap";
import API from "@/services/API.mjs";
import "@/style/RelatedDocumentSelector.css";
import { PiFileMagnifyingGlassLight } from "react-icons/pi";
import DocumentDetailsModal from "@/components/DocumentDetailsModal";
import { Pagination } from "react-bootstrap";

function RelatedDocumentsSelector({
  mode,
  edit,
  allDocuments,
  relatedDocuments,
  selectedDocuments,
  selectedConnectionTypes,
  onDocumentSelect, // handleDocumentSelect
  onRelatedDocumentClick, // handleRelatedDocumentClick
  onConnectionTypeChange,
  setSelectedConnectionTypes, // setSelectedConnectionTypes
}) {
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState(allDocuments); // Filtered documents
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10; // Documenti per pagina
  // Fetch connection types on component mount
  useEffect(() => {
    console.log(selectedConnectionTypes);
    const fetchConnectionTypes = async () => {
      try {
        const response = await API.getConnectionTypes(); // Fetch from API
        setConnectionTypes(response);
      } catch (error) {
        console.error("Error fetching connection types:", error);
      }
    };
    fetchConnectionTypes();
  }, []);

  useEffect(() => {
    console.log(edit)
    const uniqueDocuments = allDocuments.filter(
      (doc, index, self) => self.findIndex((d) => d.id === doc.id) === index
    );
    console.log(filteredDocuments);
    setFilteredDocuments(uniqueDocuments);
    console.log(uniqueDocuments);
  }, [allDocuments, mode, edit]);
  
  // useEffect(() => {
  //   // Filter documents based on the search query
  //   if (!searchQuery) {
  //     console.log(allDocuments)
  //     setFilteredDocuments(allDocuments); // Show all documents if no query
  //   } else {
  //     const lowerCaseQuery = searchQuery.toLowerCase();
  //     setFilteredDocuments(
  //       allDocuments.filter((doc) =>
  //         doc.title.toLowerCase().includes(lowerCaseQuery)
  //       )
  //     );
  //   }
  // }, [searchQuery, allDocuments]);
  useEffect(() => {
    // Rimuovi duplicati dai documenti filtrati
    const uniqueDocuments = allDocuments.reduce((acc, doc) => {
      if (!acc.some((item) => item.id === doc.id)) {
        acc.push(doc);
      }
      return acc;
    }, []);
  
    if (!searchQuery) {
      setFilteredDocuments(uniqueDocuments); // Usa i documenti unici se non c'è una query di ricerca
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredDocuments(
        uniqueDocuments.filter((doc) =>
          doc.title.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [allDocuments, searchQuery]);

  // Initialize connection types for related documents
  useEffect(() => {
    const initialConnectionTypes = relatedDocuments.map((doc) => ({
      id: doc.id,
      type: doc.connectionType || [],
    }));
    setSelectedConnectionTypes(initialConnectionTypes);
  }, [relatedDocuments, setSelectedConnectionTypes]);

  const handleIconClick = async (doc) => {
    try {
      const docData = await API.getData(doc.id);
      setCurrentDocument(docData);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDocument(null);
  };

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages).keys()].map((page) => (
          <Pagination.Item
            key={page + 1}
            active={currentPage === page + 1}
            onClick={() => handlePageChange(page + 1)}
          >
            {page + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value); // Update the search query
  };
  
  const handleRowClick = (docId, e) => {
    if (mode === "view" && !edit) {
      onRelatedDocumentClick(docId); // View document details
      return;
    }
    if (e.target.type === "checkbox") return; // Don't trigger row click when clicking checkbox

    const isSelected = selectedDocuments.includes(docId);
    if (isSelected) {
      // Deseleziona il documento
      onDocumentSelect(docId); // Rimuove il documento da selectedDocuments
      setSelectedConnectionTypes((prev) =>
        prev.filter((item) => item.id !== docId) // Rimuove tutti i tipi di connessione associati a questo documento
      );
    } else {
      // Seleziona il documento
      onDocumentSelect(docId); // Aggiunge il documento a selectedDocuments
      // Aggiungi un nuovo oggetto con tipo vuoto
      setSelectedConnectionTypes((prev) => [
        ...prev,
        { id: docId, type: "" }, // Aggiungi un nuovo elemento con tipi vuoti
      ]);
    }
    console.log(selectedConnectionTypes);
  };

  const handleCheckboxChange = (docId, e) => {
    e.stopPropagation(); // Prevent row click event
    const isSelected = selectedDocuments.includes(docId);
    if (isSelected) {
      // Deseleziona il documento
      onDocumentSelect(docId);
      setSelectedConnectionTypes((prev) =>
        prev.filter((item) => item.id !== docId)
      );
    } else {
      // Seleziona il documento
      onDocumentSelect(docId);
      setSelectedConnectionTypes((prev) => [
        ...prev,
        { id: docId, type: "" }, // Add empty type when selecting
      ]);
    }
    console.log(selectedConnectionTypes);
  };

  return (
    <div className="document-list">
      <div className="search-bar-list">
        <input
          type="text"
          placeholder="Enter the document name to search"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input-list"
        />
      </div>
      {filteredDocuments.length === 0 ? (
        <div className="no-doc-message">
          <p>No documents found matching your search.</p>
        </div>
      ) : (
      <ListGroup className="relatedDocs">
        <ListGroup.Item className="relatedDocs-header">
          <Row>
            <Col md={1}></Col>
            <Col md={3}>Title</Col>
            <Col md={2}>Stakeholders</Col>
            <Col md={2}>Type</Col>
            <Col md={2}>Connection Types</Col>
            <Col md={2}></Col>
          </Row>
        </ListGroup.Item>
        {filteredDocuments.map((doc, num) => (
          <ListGroup.Item
            key={doc.id}
            className={selectedDocuments.includes(doc.id) ? "selected" : ""}
            onClick={(e) => handleRowClick(doc.id, e)}
          >
            <Row className="align-items-center">
              {/* Checkbox for selection (only in add/edit modes) */}
               <Col md={1} className="text-center">
                {(mode === "add" || edit) ? (
                  <Form.Check
                    type="checkbox"
                    role="checkbox"
                    id={`checkbox-${doc.id}`}
                    aria-label={`checkbox-${doc.id}`}
                    aria-checked={selectedDocuments.includes(doc.id)}
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={(e) => {
                     handleCheckboxChange(doc.id,e)
                    }}
                  />) : (num + 1)
                }
              </Col>
              <Col md={3}>{doc.title}</Col>
              <Col md={2}>{doc.stakeholders.join(", ")}</Col>
              <Col md={2}>{doc.type}</Col>
              <Col md={3}>
              {/* In modalità view, mostra solo i tipi di connessione associati al documento */}
              {mode === "view" && !edit ? (
                // Trova i tipi di connessione associati al documento
                selectedConnectionTypes
                  .filter((item) => item.id === doc.id) // Filtra per ID documento
                  .map((item) => item.type) // Prendi i tipi di connessione
                  .join(", ") // Concatenali con una virgola
              ) : (
                // In modalità add/edit, mostra i bottoni solo se il documento è selezionato
                selectedDocuments.includes(doc.id) && connectionTypes.length > 0
                  ? connectionTypes.map((type, index) => {
                      const relatedDoc = {
                        id: doc.id,
                        type: selectedConnectionTypes
                          .filter((item) => item.id === doc.id)
                          .map((item) => item.type),
                      };

                      return (
                        <Button
                          key={type}
                          variant={
                            relatedDoc.type.includes(type)
                              ? ["primary", "success", "warning", "danger"][index % 4] // Rotazione dei colori
                              : "outline-secondary"
                          }
                          size="sm"
                          className="me-1"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita il click sulla riga
                            onConnectionTypeChange(doc.id, type); // Cambia il tipo di connessione
                          }}
                        >
                          {type.charAt(0)} {/* Mostra solo la prima lettera */}
                        </Button>
                      );
                    })
                  : null // Non mostrare nulla se il documento non è selezionato
              )}
              </Col>
              <Col>
                {/* Preview Button */}
                <span className="filesymbol">
                  <PiFileMagnifyingGlassLight
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      handleIconClick(doc);
                    }}
                  />
                </span>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
        <h5 className="legend-title"> Connection types legend</h5>
        <div className="legend-container">
        <div className="legend">
        <Button variant="primary" className="legend-button">
          D
        </Button> <div className="legend-text"> Direct Consequence </div>
        </div>
        <div className="legend">
        <Button variant="success" className="legend-button">
          C
        </Button> <div className="legend-text"> Collateral Consequence </div>
        </div>
        <div className="legend">
        <Button variant="warning" className="legend-button">
          P
        </Button> <div className="legend-text"> Projection </div>
        </div>
        <div className="legend">
        <Button variant="danger" className="legend-button">
          U
        </Button> <div className="legend-text"> Update </div>
        </div>
        </div>
      </ListGroup>)}
      {renderPagination()}
      <DocumentDetailsModal
        show={showModal}
        onHide={handleCloseModal}
        document={currentDocument}
      />
    </div>
  );
}

export default RelatedDocumentsSelector;