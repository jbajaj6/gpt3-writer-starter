import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import { useState } from 'react';

const Home = () => {

  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    setHasGenerated(false);

    // console.log("Calling OpenAI...")
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
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
        <div className="prompt-container">
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
            <button className={isGenerating ? 'generate-button loading' : 'generate-button'}  onClick={callGenerateEndpoint}>
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