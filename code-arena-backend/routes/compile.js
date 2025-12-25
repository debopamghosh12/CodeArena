const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { code, language, input } = req.body;

  // Language map (Frontend vs Piston API names)
  const langMap = {
    "cpp": "c++",
    "python": "python",
    "java": "java",
    "javascript": "javascript",
    "c": "c"
  };

  // Default versions for Piston
  const versionMap = {
    "c++": "10.2.0",
    "python": "3.10.0",
    "java": "15.0.2",
    "javascript": "18.15.0",
    "c": "10.2.0"
  };

  const apiLang = langMap[language] || "python";
  const apiVersion = versionMap[apiLang];

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: apiLang,
      version: apiVersion,
      files: [
        {
          content: code,
        },
      ],
      stdin: input || "", // User input or Test case input
    });

    res.json(response.data);
  } catch (error) {
    console.error("Compiler Error:", error.message);
    res.status(500).json({ run: { output: "Error executing code. Server might be busy." } });
  }
});

module.exports = router;