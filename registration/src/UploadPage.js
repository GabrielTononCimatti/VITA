import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
    const [description, setDescription] = useState("");
    const [projectID, setProjectID] = useState("");
    const [stageID, setStageID] = useState("");
    const [file, setFile] = useState(null);

    async function handleUpload() {


    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Upload Document</h2>
            <div>
                <label>Description:</label><br />
                <input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
                <label>Project ID:</label><br />
                <input value={projectID} onChange={e => setProjectID(e.target.value)} />
            </div>
            <div>
                <label>Stage ID:</label><br />
                <input value={stageID} onChange={e => setStageID(e.target.value)} />
            </div>
            <div>
                <label>File:</label><br />
                <input type="file" onChange={e => setFile(e.target.files[0])} />
            </div>
            <br />
            <button onClick={handleUpload}>Send</button>
        </div>
    );
}
