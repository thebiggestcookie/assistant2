import React, { useState, useEffect } from 'react';
import { Phone, Eye, Play } from 'lucide-react';
import { db } from '../db/database';

const TestCall: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [prompt, setPrompt] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
  });

  useEffect(() => {
    const loadAPIKeys = async () => {
      const keys = await Promise.all([
        db.apiKeys.get('openai'),
        db.apiKeys.get('twilio_account_sid'),
        db.apiKeys.get('twilio_auth_token'),
        db.apiKeys.get('twilio_phone_number'),
      ]);
      setApiKeys({
        openai: keys[0]?.value || '',
        twilio_account_sid: keys[1]?.value || '',
        twilio_auth_token: keys[2]?.value || '',
        twilio_phone_number: keys[3]?.value || '',
      });
    };
    loadAPIKeys();
  }, []);

  const initiateCall = async () => {
    setCallStatus('Initiating call...');
    setErrorDetails('');
    setAIResponse('');
    try {
      const response = await fetch('/api/initiate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phoneNumber, prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCallStatus(`Call initiated successfully. SID: ${data.callSid}`);
      setAIResponse(`AI Response: ${data.aiResponse}`);
    } catch (error) {
      setCallStatus('Error occurred during call');
      setErrorDetails(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Test Call</h2>
      <div>
        <label className="block mb-1">Phone Number:</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="+1234567890"
        />
      </div>
      <div>
        <label className="block mb-1">AI Prompt:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter the AI prompt for the call"
        />
      </div>
      <button
        onClick={initiateCall}
        className="bg-green-500 text-white p-2 rounded flex items-center justify-center w-full"
      >
        <Phone size={20} className="mr-2" /> Initiate Call
      </button>
      {callStatus && (
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <h3 className="font-bold">Call Status:</h3>
          <p>{callStatus}</p>
        </div>
      )}
      {errorDetails && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <h3 className="font-bold">Error Details:</h3>
          <p>{errorDetails}</p>
        </div>
      )}
      {aiResponse && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h3 className="font-bold">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
      <div className="mt-8">
        <h3 className="font-bold mb-2">API Keys (for debugging):</h3>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="bg-gray-200 p-2 rounded flex items-center mb-2"
        >
          <Eye size={20} className="mr-2" /> {showKeys ? 'Hide' : 'Show'} API Keys
        </button>
        {showKeys && (
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(apiKeys, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TestCall;