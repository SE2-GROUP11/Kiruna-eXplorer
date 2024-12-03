import fetchRequest from './fetchHelper.js';

async function login(username, password) {
  return await fetchRequest('/sessions/', 'POST', { username, password });
}

async function logout() {
  return await fetchRequest('/sessions/', 'DELETE');
}


async function getUser() {
  return await fetchRequest('/sessions/');
}

async function AddDocumentDescription(doc, selectedDocuments, coordinates, area) {
  
  const body = {
    title: doc.title,
    description: doc.description,
    stakeholders: doc.stakeholder,
    scale: doc.scale,
    issuanceDate: doc.issuanceDate,
    type: doc.type,
    language: doc.language,
    coordinates: (area.length>0?{}:coordinates),
    area: area,
    connectionIds: selectedDocuments,
  };
  return await fetchRequest('/documents/', 'POST', body);
}

async function EditDocumentDescription(
  doc,
  selectedDocuments,
  coordinates,
  area,
  id
) {
  const body = {
    title: doc.title,
    description: doc.description,
    stakeholders: doc.stakeholder,
    scale: doc.scale,
    issuanceDate: doc.issuanceDate,
    type: doc.type,
    language: doc.language,
    coordinates: (area.length>0?{}:coordinates),
    area: area,
    connectionIds: selectedDocuments,
  };
  console.log(body)
  return await fetchRequest(`/documents/${id}`, 'PUT', body);
}
async function getTypes() {
  const response = await fetchRequest('/documents/types');
  return response.data.map((type) => ({ value: type, label: type }));
}

async function getConnectionTypes() {
  const response = await fetchRequest('/documents/connectionTypes');
  return response.documentConnectionTypes;
}

async function getStake() {
  const response = await fetchRequest('/documents/stakeholders');
  return response.data.map((stake) => ({ value: stake, label: stake }));
}

async function getDocuments() {
    const response = await fetchRequest('/documents');
    return response.data
}

async function getSortedDocuments(key, dir) {
    const response = await fetchRequest(`/documents?sort=${key},${dir}`);
    return response.data
}

async function getFIilteredDocuments(filters) {
  let query = ``;
  if(filters.stakeholders)
    query = query.concat('stakeholders=',filters.stakeholders)
  if(filters.documentTypes)
    query = query.concat((query!==''? '&' : ''),'documentTypes=',filters.documentTypes)
  if(filters.issuanceDateStart)
    query = query.concat((query!==''? '&' : ''),'issuanceDateStart=',filters.issuanceDateStart)
  if(filters.issuanceDateEnd)
    query = query.concat((query!==''? '&' : ''),'issuanceDateEnd=',filters.issuanceDateEnd)
  const response = await fetchRequest(`/documents?${query}`);
  return response.data
}

async function searchDoc(name) {
    const response = await fetchRequest(`/documents?title=${name}`);
    return response.data;
}

async function getData(id) {
  const response = await fetchRequest(`/documents/${id}`);
  return response.data;
}

async function getScale() {
  const response = await fetchRequest('/documents/scales');
  return response.data.map((scale) => ({ value: scale, label: scale }));
}

async function addType(type) {
  return await fetchRequest('/documents/types', 'POST', { name: type });
}

async function addStakeholder(stakeholder) {
  return await fetchRequest('/documents/stakeholders', 'POST', {
    name: stakeholder,
  });
}

async function addScale(scale) {
  return await fetchRequest('/documents/scales', 'POST', { name: scale });
}

async function uploadDocument(documentId, file) {
  console.log(documentId);

  const formData = new FormData();
  formData.append('file', file);

  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const response = await fetch(`http://localhost:3001/documents/${documentId}/files`, {
      method: 'POST',
      body: formData,
      credentials: 'include', 
      mode: 'cors', 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'File upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload failed', error);
    throw error;
  }
}

const API = {
  login,
  logout,
  getUser,
  getTypes,
  getDocuments,
  getData,
  EditDocumentDescription,
  AddDocumentDescription,
  getStake,
  getConnectionTypes,
  addType,
  addStakeholder,
  addScale,
  getScale,
  getSortedDocuments,
  searchDoc,
  getFIilteredDocuments,
  uploadDocument
};

export default API;