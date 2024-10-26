'use client'

import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

export default function PDFQAInterface() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    } else {
      alert('Please select a valid PDF file.')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first.')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('http://localhost:8080/api/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('PDF uploaded successfully!')
      // Keep the file name after upload success
      setFileName(file.name)
    } catch (error) {
      console.error('Error uploading PDF:', error)
      alert('Failed to upload PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    if (!fileName) {
      alert('Please upload a PDF first.')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/api/pdf/question', { 
        filename: fileName, // Use the uploaded file's name here
        question: question
      })
      setAnswer(response.data)
    } catch (error) {
      console.error('Error fetching answer:', error)
      setAnswer('Sorry, the answer to your question was not found in the PDF content.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">PDF Q&A System</h1>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Select PDF
            </button>
            <span className="text-gray-600">{fileName || 'No file selected'}</span>
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Upload'}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                  Ask Question
                </>
              )}
            </button>
          </form>
          {answer && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Answer:</h3>
              <p className="bg-gray-100 p-4 rounded-lg ">{answer}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}