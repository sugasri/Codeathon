import React, {useState} from "react";
import axios from "axios";
import './Home1.css';

const Home1 = () => {
    const [searchText, setSearchText] = useState(""); 
    const [maskChar, setMaskChar] = useState(""); 
    const [files, setFiles] = useState([]); 
    const [message, setMessage] = useState(""); 
    const [showConfirm, setShowConfirm] = useState(false); 
    const [allSelected, setAllSelected] = useState(false); 
    const [showSuccess, setShowSuccess] = useState(false);  // New state for success modal

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/search', {
                params: { term: searchText },
            });
            const new_files = response.data.files.map((file) => ({ ...file, isSelected: false }));
            setFiles(new_files);
            setAllSelected(false);
            setMessage(response.data.length === 0 ? "No file found with entered search criteria." : "");
        } catch (error) {
            console.error("Error during search:", error);
        }
    };

    const handleMask = async () => {
        const selectedFiles = files.filter(file => file.isSelected);
        try {
            await axios.post("http://localhost:5000/api/mask", {
                files: selectedFiles,
                searchText,
                maskChar,
            });
            setShowConfirm(false);
            setFiles([]);
            setMaskChar(''); // clear the mask input
            setShowSuccess(true);  // Show success popup after successful masking
        } catch (error) {
            console.error("Error during masking:", error);
        }
    };

    const handleSelectAll = () => {
        const updatedFiles = files.map((file) => ({ ...file, isSelected: !allSelected }));
        setFiles(updatedFiles);
        setAllSelected(!allSelected);
    };

    const toggleSelect = (index) => {
        if (files[index].isSelected && allSelected) setAllSelected(false);
        setFiles((prevFiles) =>
            prevFiles.map((prevFile, i) =>
                i === index ? { ...prevFile, isSelected: !prevFile.isSelected } : prevFile
            )
        );
    };

    return (
        <div className="container">
            <h2>Text Finder and Masking Tool</h2>
            <input
                type="text"
                placeholder="Search text..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {files.length === 0 ? (
                <p>No files found</p>
            ) : (
                <>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                    />
                    Select all
                    <ul>
                        {files.map((file, index) => (
                            <li key={index}>
                                <input
                                    type="checkbox"
                                    checked={file.isSelected}
                                    onChange={() => toggleSelect(index)}
                                />
                                {file.name} - Count: {file.count}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <input
                type="text"
                placeholder="Mask with character"
                value={maskChar}
                onChange={(e) => setMaskChar(e.target.value)}
            />
            <button onClick={() => setShowConfirm(true)}>Submit</button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal">
                    <p>
                        Are you sure you want to mask the searched text "{searchText}" with "{maskChar}"?
                    </p>
                    <button onClick={handleMask}>Yes</button>
                    <button onClick={() => setShowConfirm(false)}>No</button>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="modal">
                    <p>Successfully masked!</p>
                    <button onClick={() => setShowSuccess(false)}>OK</button> {/* Close the success modal */}
                </div>
            )}
        </div>
    );
};

export default Home1;
