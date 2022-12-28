import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { createWorker } from 'tesseract.js';
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

const Home = () => {
  const toggleButtonList = ['Flirty', 'Sarcastic', 'Witty', 'Affectionate', "Empathetic"];

  // Use the useState hook to create an array of state variables and set functions for the toggle buttons
  const [buttonStateArray, setButtonStateArray] = useState(
    toggleButtonList.map(() => false)
  );

  // Create a function to toggle the state of a button
  const toggleButton = (buttonNumber) => {
    setButtonStateArray((prevState) => {
      const newState = [...prevState];
      newState[buttonNumber - 1] = !newState[buttonNumber - 1];
      return newState;
    });
  }

  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [ocrState, setOcrState] = useState({
    isProcessing: false,
    ocrText: '',
    pctg: '0.00'
  });
  const [files, setFiles] = useState([]);

  const worker = useRef();

  const updateProgressAndLog = (m) => {
    var MAX_PARCENTAGE = 1;
    var DECIMAL_COUNT = 2;

    if (m.status === "recognizing text") {
      var pctg = (m.progress / MAX_PARCENTAGE) * 100
      setOcrState({
        ...ocrState,
        pctg: pctg.toFixed(DECIMAL_COUNT)
      })

    }
  }

  const _createWorker = async (worker, createWorker, updateProgressAndLog) => {
    worker.current = await createWorker({
      logger: m => updateProgressAndLog(m),
    });
  }

  useEffect(() => {
    _createWorker(worker, createWorker, updateProgressAndLog);
  }, [])

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    setHasGenerated(false);

    const adjectives = []

    for (let i = 0; i < toggleButtonList.length; i++) {
      if (buttonStateArray[i]) {
        adjectives.push(toggleButtonList[i]);
      }
    }

    // console.log("Calling OpenAI...")
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput, adjectives }),
    });

    const data = await response.json();
    const { output } = data;
    // console.log("OpenAI replied...", output.text)

    setApiOutput(`${output.text}`);
    setIsGenerating(false);
    setHasGenerated(true);
  }

  const onUserChangedText = (event) => {
    // console.log(event.target.value);
    setUserInput(event.target.value);
  }

  const doOCR = async (file) => {
    setOcrState({
      isProcessing: true,
      ocrText: '',
      pctg: '0.00'
    })
    // Loading tesseract.js functions
    await worker.current.load();
    // Loading language as 'English'
    await worker.current.loadLanguage('eng');
    await worker.current.initialize('eng');
    // Sending the File Object into the Recognize function to
    // parse the data
    const { data: { text } } = await worker.current.recognize(file.file);
    setOcrState({
      isProcessing: false,
      ocrText: text,
      pctg: '100.00'
    })
    setUserInput(text);
  };

  return (
    <div className="root">
      <Head>
        <title>nextext</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>nextext</h1>
          </div>
          <div className="header-subtitle">
            <h2>tell me ur past texts on a dating app, and i'll tell u what to say next</h2>
            <p><b>example:</b></p>
            <p>me: hey</p>
            <p>her: ur dog likes me more than u</p>
            <br />
            <p><b>nextext:</b> so i have to step up my game to win you and my dog over</p>
          </div>
          <h2>👇👇👇</h2>
        </div>
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          maxFiles={3}
          name="files"
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          onaddfile={(err, file) => {
            doOCR(file);
          }}
          onremovefile={(err, fiile) => {
            setOcrState({
              isProcessing: false,
              ocrText: '',
              pctg: '0.00',
            })
          }}
        />
        <div className="prompt-container">
          {toggleButtonList.map((button, index) => (
            <button
              className='select'
              style={{
                borderRadius: '20px',
                outlineOffset: "-2px",
                outline: buttonStateArray[index] ? "2px solid rgb(255, 27, 103)" : 'none',
                color: buttonStateArray[index] ? "rgb(255, 27, 103)" : 'black'
              }}
              key={index}
              onClick={() => toggleButton(index + 1)}
            >
              {button}
            </button>
          ))}
          <textarea
            placeholder="Me: hey..."
            className="prompt-box"
            value={userInput}
            onChange={onUserChangedText}
          />
          {hasGenerated ? <p style={{
            color: "#00ff00"
          }}>
            scroll down to see your next possible texts 👀
          </p> : ""}

          <div className="prompt-buttons">
            <button className={isGenerating ? 'generate-button loading' : 'generate-button'} onClick={callGenerateEndpoint}>
              {isGenerating ? <span className="loader"></span> : "generate"}
            </button>
          </div>
          {apiOutput && (
            <div className="output">
              <div className="output-header-container">
                <div className="output-header">
                  <h3>suggestions</h3>
                </div>
              </div>
              <div className="output-content">
                <p>{apiOutput}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;