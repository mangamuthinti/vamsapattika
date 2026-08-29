import React, { useState, useEffect } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import CustomAlert from './CustomAlert';

const PersonModal = () => {
  const { familyData, modalState, setModalState, addPerson, updatePerson, selectedPerson, setSelectedPerson } = useFamilyTree();

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    deathDate: '',
    occupation: '',
    photo: null,
    marriageDate: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (modalState.isOpen && modalState.mode === 'edit' && selectedPerson) {
      const person = familyData[selectedPerson];
      if (person) {
        // Get marriage date - it might be stored on this person or their spouse
        let marriageDate = person.marriageDate || '';
        if (!marriageDate && person.spouse) {
          const spouse = familyData[person.spouse];
          marriageDate = spouse?.marriageDate || '';
        }

        setFormData({
          name: person.name,
          gender: person.gender,
          birthDate: person.birthDate || '',
          deathDate: person.deathDate || '',
          occupation: person.occupation || '',
          photo: person.photo,
          marriageDate: marriageDate
        });
        setPhotoPreview(person.photo);
      }
    } else {
      setFormData({
        name: '',
        gender: '',
        birthDate: '',
        deathDate: '',
        occupation: '',
        photo: null,
        marriageDate: ''
      });
      setPhotoPreview(null);
    }
  }, [modalState, selectedPerson, familyData]);

  const handleClose = () => {
    setModalState({ isOpen: false, mode: 'add', parentId: null });
    setSelectedPerson(null); // Clear selected person to hide properties panel
    setFormData({
      name: '',
      gender: '',
      dates: '',
      occupation: '',
      photo: null,
      marriageDate: ''
    });
    setPhotoPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target.result;
        setFormData(prev => ({ ...prev, photo: photoData }));
        setPhotoPreview(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gender) {
      setAlertState({
        isOpen: true,
        message: 'Please fill in Name and Gender (required fields)'
      });
      return;
    }

    if (modalState.mode === 'edit' && selectedPerson) {
      updatePerson(selectedPerson, formData);

      // If this person has a spouse and marriage date was updated, update spouse too
      const person = familyData[selectedPerson];
      if (person?.spouse && formData.marriageDate) {
        updatePerson(person.spouse, { marriageDate: formData.marriageDate });
      }
    } else if (modalState.mode === 'spouse') {
      addPerson(formData, modalState.parentId, true);
    } else {
      addPerson(formData, modalState.parentId, false);
    }

    handleClose();
  };

  const getTitle = () => {
    if (modalState.mode === 'edit') return 'Edit Person Information';
    if (modalState.mode === 'spouse') return 'Add Spouse';
    return 'Add New Family Member';
  };

  const getSubmitText = () => {
    if (modalState.mode === 'edit') return 'Update Person';
    if (modalState.mode === 'spouse') return 'Add Spouse';
    return 'Add Person';
  };

  if (!modalState.isOpen) return null;

  return (
    <>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
      />
      <div className="modal">
        <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>{getTitle()}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="birthDate">Birth Date (optional):</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                placeholder="Enter Birth Date"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="deathDate">Death Date (optional):</label>
              <input
                type="date"
                id="deathDate"
                name="deathDate"
                value={formData.deathDate}
                onChange={handleInputChange}
                placeholder="Enter Death Date"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="occupation">Occupation (optional):</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              placeholder="Enter Occupation"
            />
          </div>

          {(modalState.mode === 'spouse' || (modalState.mode === 'edit' && selectedPerson && familyData[selectedPerson]?.spouse)) && (
            <div className="form-group">
              <label htmlFor="marriageDate">Marriage Date & Time:</label>
              <input
                type="datetime-local"
                id="marriageDate"
                name="marriageDate"
                value={formData.marriageDate}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="photo">Photo (optional):</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {getSubmitText()}
            </button>
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default PersonModal;
