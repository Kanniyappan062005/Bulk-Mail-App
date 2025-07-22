import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const App = () => {
  const [msg, setMsg] = useState("");
  const [sendStatus, setSendStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target.result;
      const workBook = XLSX.read(data, { type: "binary" });
      const sheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[sheetName];
      const emailJson = XLSX.utils.sheet_to_json(workSheet, { header: "A" });

      const extractedEmails = emailJson.map((item) => item.A).filter(Boolean);
      setEmailList(extractedEmails);
    };
  };

  const handleSend = () => {
    if (msg.trim() === "") {
      alert("Please enter a message before sending.");
      return;
    }

    if (emailList.length === 0) {
      alert("Please upload a file with email addresses.");
      return;
    }

    setSendStatus(true);

    axios
      .post("http://localhost:5000/sendmail", {
        msg: msg,
        emailList: emailList,
      })
      .then((res) => {
        if (res.data === true) {
          alert("Email Sent Successfully!");
        } else {
          alert("Email Failed");
        }
        setSendStatus(false);
        setMsg("");
        setEmailList([]);
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong while sending emails.");
        setSendStatus(false);
      });
  };

  return (
    <div className="text-center text-white min-h-screen bg-blue-500">
      <h1 className="bg-blue-900 p-3 text-3xl font-bold">Bulk Mail</h1>
      <h2 className="bg-blue-800 p-3 md:font-medium text-[12px] md:text-[14px]">
        Send your business promotion to multiple emails at once!
      </h2>
      <h3 className="bg-blue-600 p-3 font-semibold">Drag and Drop your File</h3>

      <div className="bg-blue-400 p-3">
        <textarea
          className="w-[80%] h-44 my-5 p-2 text-black focus:outline-none rounded disabled"
          placeholder="Enter your email text..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
          disabled={sendStatus}
        ></textarea>

        {/* File Upload */}
        <div className="flex justify-center">
          <label
            htmlFor="fileInput"
            className={`w-[60%] p-5 border-[3px] font-bold text-yellow-200 border-black border-dashed rounded-md cursor-pointer transition ${
              sendStatus
                ? "opacity-50 cursor-not-allowed": "hover:bg-white hover:text-black"
            }`}
          >
            📂 Drag & Drop file or Click to Browse
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileInput}
            className="hidden"
            disabled={sendStatus}
          />
        </div>

        {/* Email Count */}
        <div className="flex items-center justify-center gap-2 mt-4 text-black font-semibold">
          <p>Total Email Count in File:</p>
          <span className="text-blue-900 font-bold text-xl">
            {emailList.length}
          </span>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={msg.trim() === "" || emailList.length === 0 || sendStatus}
          className={`px-6 py-2 my-4 bg-black text-white rounded transition ${
            msg.trim() === "" || emailList.length === 0 || sendStatus
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800"
          }`}
        >
          {sendStatus ? "Sending..." : "Send"}
        </button>
      </div>

      <footer className="bg-black p-4 text-white mt-10">
        <p>@Bulkmail 2025</p>
      </footer>
    </div>
  );
};

export default App;
