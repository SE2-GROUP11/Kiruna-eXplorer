import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormDocument from '../../src/pages/CreateDocument.jsx';
import API from '../../src/services/API.mjs';
import { useParams, useNavigate } from 'react-router-dom';
import { dmsToDecimal } from '../../src/utils/convertToDecimal';
import Select from 'react-select';

jest.mock('dayjs', () =>
  jest.fn(() => ({
    format: jest.fn(() => 'mocked-date'),
    add: jest.fn().mockReturnThis(),
    subtract: jest.fn().mockReturnThis(),
  }))
);
jest.mock('../../src/components/MapPointSelector', () => (props) => (
  <div data-testid="MapPointSelector" {...props}></div>
));

jest.mock('../../src/utils/convertToDecimal', () => ({
  dmsToDecimal: jest.fn(), // crea un mock della funzione
}));

jest.mock('../../src/components/RelatedDocumentsSelector', () => (props) => (
  <div data-testid="RelatedDocumentsSelector" {...props}></div>
));

jest.mock('../../src/services/API.mjs', () => ({
  getTypes: jest.fn(), // Mock di getTypes
  getDocuments: jest.fn(),
  AddDocumentDescription: jest.fn(),
  getData: jest.fn(),
  EditDocumentDescription: jest.fn().mockResolvedValue({ success: true }),
  getStake: jest.fn() 
}));




jest.mock('../../src/mocks/Document.mjs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      title: 'Mocked Title',
      stakeholder: 'Mocked Stakeholder',
      scale: '1:100',
      issuanceDate: '2024-01-01',
      type: 'Type1',
      language: 'English',
      description: 'Mocked Description',
    };
  });
});

jest.mock("react-select", () => ({ options, value, onChange,placeholder }) => {
  function handleChange(event) {
    console.log("called");

    const option = options.find(option => {
      return option.value == event.currentTarget.value;
    });

    onChange(option);
  }
  return (
    <select
      id="uc"
      data-testid="select"
      value={value}
      onChange={event => handleChange(event)}
    >
      <option disabled value="">
            {placeholder}
          </option>
      {options?.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
});



describe('CreateDocument', () => {

  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('should render the form correctly', async () => {
    useParams.mockReturnValue({ id: '' });
    API.getTypes.mockResolvedValue([{ value: 'type1', label: 'type1' },
      { value: 'type2', label: 'type2' },
      { value: 'type3', label: 'type3' }])
      API.getStake.mockResolvedValue([{ value: 'stakeholder1', label: 'Stakeholder 1' },
        { value: 'stakeholder2', label: 'Stakeholder 2' },
        { value: 'stakeholder3', label: 'Stakeholder 3' },
        { value: 'stakeholder4', label: 'Stakeholder 4' },
        { value: 'stakeholder5', label: 'Stakeholder 5' },
        { value: 'stakeholder6', label: 'Stakeholder 6' },
        { value: 'stakeholder7', label: 'Stakeholder 7' }])
    API.getDocuments.mockResolvedValue([])
    render(<FormDocument mode="add" />);

    await waitFor(() => {
    
    const formElement = screen.getByText(/New Document/i);
    expect(formElement).toBeInTheDocument();

    const titleField = screen.getByPlaceholderText(/Enter title/i);
    expect(titleField).toBeInTheDocument();

    const stakeholderField = screen.getByText(/Select one or more stakeholders/i);
    expect(stakeholderField).toBeInTheDocument();

    const scaleField = screen.getByPlaceholderText(/Enter scale/i);
    expect(scaleField).toBeInTheDocument();

    const dateField = screen.getByText(/Issuance Date/i);
    expect(dateField).toBeInTheDocument();

    const typeField = screen.getByText(/Select type/i)
    expect(typeField).toBeInTheDocument();

    const languageField = screen.getByText(/Select language/i);
    expect(languageField).toBeInTheDocument();

    const descriptionField = screen.getByText(/Description/i);
    expect(descriptionField).toBeInTheDocument();

    const coordField = screen.getByText(/Coordinates/i);
    expect(coordField).toBeInTheDocument();
    })
  });
  
  test('submits the form and calls AddDocumentDescription', async () => {
    useParams.mockReturnValue({ id: '' });
    API.getDocuments.mockResolvedValue([])
    API.getTypes.mockResolvedValue([{ value: 'type1', label: 'type1' },
      { value: 'type2', label: 'type2' },
      { value: 'type3', label: 'type3' }])
    API.getStake.mockResolvedValue([{ value: 'stakeholder1', label: 'Stakeholder 1' },
      { value: 'stakeholder2', label: 'Stakeholder 2' },
      { value: 'stakeholder3', label: 'Stakeholder 3' },
      { value: 'stakeholder4', label: 'Stakeholder 4' },
      { value: 'stakeholder5', label: 'Stakeholder 5' },
      { value: 'stakeholder6', label: 'Stakeholder 6' },
      { value: 'stakeholder7', label: 'Stakeholder 7' }])
    API.AddDocumentDescription.mockResolvedValue({ success: true })
  
    render(<FormDocument mode="add" />);
  
    await waitFor(() => {
    const selectOptions = screen.getAllByTestId(/select/i);
    fireEvent.change(screen.getByPlaceholderText(/Enter title/i), { target: { value: 'Document Title' } });
    fireEvent.change(selectOptions[0], { target: { value: 'stakeholder6' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter scale/i), { target: { value: '1:100' } });
    fireEvent.change(screen.getByTestId(/date-input/i), { target: { value: '2024-01-01' } });
    fireEvent.change(selectOptions[1], { target: { value: 'Type1' } });
    fireEvent.change(selectOptions[2], { target: { value: 'swedish' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter description/i), { target: { value: 'Some description' } });
    fireEvent.change(screen.getByPlaceholderText(/latitude/i), { target: { value: '40.7128' } });
    fireEvent.change(screen.getByPlaceholderText(/longitude/i), { target: { value: '-74.0060' } });
    })

    fireEvent.submit(screen.getByTestId('mocked-form'));
  
    await waitFor(() => {
      expect(API.AddDocumentDescription).toHaveBeenCalledWith(
        expect.any(Object), 
        [],
        { lat: '40.7128', lng: '-74.0060' }
      );
    });
  });


  test('loads document data when in "view" mode', async () => {
    useParams.mockReturnValue({ id: '123' });
    API.getStake.mockResolvedValue([{ value: 'stakeholder1', label: 'Stakeholder 1' },
      { value: 'stakeholder2', label: 'Stakeholder 2' },
      { value: 'stakeholder3', label: 'Stakeholder 3' },
      { value: 'stakeholder4', label: 'Stakeholder 4' },
      { value: 'stakeholder5', label: 'Stakeholder 5' },
      { value: 'stakeholder6', label: 'Stakeholder 6' },
      { value: 'stakeholder7', label: 'Stakeholder 7' }])
    API.getDocuments.mockResolvedValue([])
    API.getTypes.mockResolvedValue([{ value: 'type1', label: 'type1' },
      { value: 'type2', label: 'type2' },
      { value: 'type3', label: 'type3' }])
    API.getData.mockResolvedValue({  
      title: 'Mock Title',
      stakeholders: 'stakeholder6',
      scale: 'Mock Scale',
      issuanceDate: '2023-01-01',
      type: 'type1',
      language: 'english',
      description: 'Mock description',
      coordinates: { lat: '40.7128', lng: '-74.0060' },
      connections: []  
    })
    render(<FormDocument mode="view" />);
    

    
    await waitFor(() => {
      expect(API.getData).toHaveBeenCalledWith('123')
    });
  
    await waitFor(() => {
      const selectOptions = screen.getAllByTestId(/select/i);
      expect(screen.getByPlaceholderText(/Enter title/i)).toHaveValue('Mock Title');
      expect(selectOptions[0]).toHaveValue('stakeholder6');
      expect(screen.getByPlaceholderText(/Enter scale/i)).toHaveValue('Mock Scale');
      expect(screen.getByPlaceholderText(/Enter description/i)).toHaveValue('Mock description');
      expect(selectOptions[1]).toHaveValue('type1');
      expect(selectOptions[2]).toHaveValue('english');
    });
  });

  test('shows error when required fields are empty', async () => {
    useParams.mockReturnValue({ id: '' });
    API.getTypes.mockResolvedValue([{ value: 'type1', label: 'type1' },
      { value: 'type2', label: 'type2' },
      { value: 'type3', label: 'type3' }])
    API.getStake.mockResolvedValue([{ value: 'stakeholder1', label: 'Stakeholder 1' },
      { value: 'stakeholder2', label: 'Stakeholder 2' },
      { value: 'stakeholder3', label: 'Stakeholder 3' },
      { value: 'stakeholder4', label: 'Stakeholder 4' },
      { value: 'stakeholder5', label: 'Stakeholder 5' },
      { value: 'stakeholder6', label: 'Stakeholder 6' },
      { value: 'stakeholder7', label: 'Stakeholder 7' }])
    API.getDocuments.mockResolvedValue([]);
    
    render(<FormDocument mode="add" />);
  
    // Simulate submitting the form with empty fields
    fireEvent.submit(screen.getByTestId('mocked-form'));
  
    // Wait for the form to be validated
    await waitFor(() => {
      // Check that the required fields show validation errors
      expect(screen.getByText(/Title cannot be empty!/i)).toBeInTheDocument();
      //expect(screen.getByText(/Stakeholder cannot be empty!/i)).toBeInTheDocument();
      expect(screen.getByText(/Scale cannot be empty!/i)).toBeInTheDocument();
      expect(screen.getByText(/Description cannot be empty!/i)).toBeInTheDocument();
    });
  });
  
});