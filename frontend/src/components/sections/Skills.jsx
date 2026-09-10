import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaNodeJs, FaPython, FaReact, FaDocker, FaGithub, FaAws,
  FaDatabase, FaJs, FaHtml5, FaCss3Alt, FaBrain, FaFileCode,
  FaServer, FaBolt, FaExchangeAlt, FaPlug, FaKey, FaPalette,
  FaLeaf, FaMemory, FaGitAlt, FaInfinity, FaPaperPlane,
  FaLink, FaRobot, FaSearch, FaFileImage, FaShieldAlt
} from 'react-icons/fa';
import TerminalPanel from '../TerminalPanel';

const skillsData = [
  // Languages
  {
    id: 'javascript',
    category: 'Languages',
    name: 'JavaScript',
    icon: <FaJs />,
    color: '#f7df1e',
    fileName: 'asyncDemo.js',
    runCommand: 'node asyncDemo.js',
    codeSnippet: `console.log("Initializing event loop...");\n\nsetTimeout(() => {\n  console.log("Data fetched successfully.");\n}, 1500);\n\nPromise.resolve().then(() => {\n  console.log("Processing microtasks...");\n});\n\nconsole.log("Waiting for async operations...");`,
    outputSnippet: `Initializing event loop...\nWaiting for async operations...\nProcessing microtasks...\nData fetched successfully.`,
    visualOutput: (
      <div style={{ padding: '1rem', background: '#222', borderRadius: '8px', borderLeft: '4px solid #f7df1e', fontFamily: 'monospace', color: '#fff', fontSize: '0.8rem' }}>
        <span style={{color: '#f7df1e'}}>⚠️ Promise resolved:</span> DOM Updated.
      </div>
    )
  },
  {
    id: 'python',
    category: 'Languages',
    name: 'Python',
    icon: <FaPython />,
    color: '#3776ab',
    fileName: 'data_processor.py',
    runCommand: 'python data_processor.py',
    codeSnippet: `import time\nfrom typing import List\n\ndef process_data(data: List[int]) -> List[int]:\n    print("Starting data pipeline...")\n    time.sleep(0.5)\n    result = [x * 2 for x in data if x % 2 == 0]\n    return result\n\nraw_data = [1, 2, 3, 4, 5, 6]\nclean_data = process_data(raw_data)\nprint(f"Processed chunks: {len(clean_data)}")`,
    outputSnippet: `Starting data pipeline...\nProcessed chunks: 3`
  },
  {
    id: 'cpp',
    category: 'Languages',
    name: 'C++',
    icon: <FaFileCode />,
    color: '#00599C',
    fileName: 'main.cpp',
    runCommand: 'g++ main.cpp && ./a.out',
    codeSnippet: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> v = {4, 1, 8, 3};\n    std::sort(v.begin(), v.end());\n    \n    std::cout << "Optimized vector:\\n";\n    for(int i : v) std::cout << i << " ";\n    return 0;\n}`,
    outputSnippet: `Optimized vector:\n1 3 4 8 `
  },
  {
    id: 'sql',
    category: 'Languages',
    name: 'SQL',
    icon: <FaDatabase />,
    color: '#e38c00',
    fileName: 'query.sql',
    runCommand: 'psql -U admin -f query.sql',
    codeSnippet: `WITH ActiveUsers AS (\n  SELECT user_id, COUNT(order_id) as orders\n  FROM transactions\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY user_id\n)\nSELECT AVG(orders) as avg_orders\nFROM ActiveUsers;`,
    outputSnippet: ` avg_orders \n------------\n    4.2857\n(1 row)`
  },

  // Backend
  {
    id: 'node',
    category: 'Backend',
    name: 'Node.js',
    icon: <FaNodeJs />,
    color: '#339933',
    fileName: 'server.js',
    runCommand: 'npm start',
    codeSnippet: `const { createServer } = require('http');\n\nconst server = createServer((req, res) => {\n  setTimeout(() => {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ status: 'active', memory: process.memoryUsage().rss }));\n  }, 120);\n});\n\nserver.listen(3000, () => console.log('Listening on :3000'));`,
    outputSnippet: `Listening on :3000\n[Request] GET / 200 OK`
  },
  {
    id: 'express',
    category: 'Backend',
    name: 'Express.js',
    icon: <FaServer />,
    color: '#ffffff',
    fileName: 'app.js',
    runCommand: 'node app.js',
    codeSnippet: `const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.post('/api/users', (req, res) => {\n  const user = req.body;\n  console.log('Registering:', user.email);\n  res.status(201).json({ id: 901, ...user });\n});\n\napp.listen(8080);`,
    outputSnippet: `Registering: user@example.com\nPOST /api/users 201 12ms`
  },
  {
    id: 'fastapi',
    category: 'Backend',
    name: 'FastAPI',
    icon: <FaBolt />,
    color: '#009688',
    fileName: 'main.py',
    runCommand: 'uvicorn main:app --reload',
    codeSnippet: `from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/items/{item_id}")\nasync def read_item(item_id: int, q: str = None):\n    return {"item_id": item_id, "q": q}\n\n# Auto OpenAPI docs generated at /docs`,
    outputSnippet: `INFO:     Started server process [4534]\nINFO:     Waiting for application startup.\nINFO:     Application startup complete.`
  },
  {
    id: 'restapi',
    category: 'Backend',
    name: 'REST APIs',
    icon: <FaExchangeAlt />,
    color: '#ff6c37',
    fileName: 'router.js',
    runCommand: 'node router.js',
    codeSnippet: `// Standardizing REST Responses\nfunction buildResponse(data, meta = {}) {\n  return {\n    success: true,\n    data,\n    meta: {\n      timestamp: new Date().toISOString(),\n      ...meta\n    }\n  };\n}`,
    outputSnippet: `Validating REST architecture standards... OK`
  },
  {
    id: 'websocket',
    category: 'Backend',
    name: 'WebSocket',
    icon: <FaPlug />,
    color: '#010101',
    fileName: 'socket.js',
    runCommand: 'node socket.js',
    codeSnippet: `const WebSocket = require('ws');\nconst wss = new WebSocket.Server({ port: 8080 });\n\nwss.on('connection', function connection(ws) {\n  ws.on('message', function incoming(message) {\n    console.log('received: %s', message);\n    ws.send(JSON.stringify({ ack: true }));\n  });\n});`,
    outputSnippet: `WS Server listening on :8080\nreceived: {"type":"PING"}\nsent: {"ack":true}`
  },
  {
    id: 'jwt',
    category: 'Backend',
    name: 'JWT',
    icon: <FaKey />,
    color: '#d63aff',
    fileName: 'auth.js',
    runCommand: 'node auth.js',
    codeSnippet: `const jwt = require('jsonwebtoken');\n\nconst token = jwt.sign(\n  { userId: 123, role: 'admin' }, \n  'super_secret_key', \n  { expiresIn: '1h' }\n);\n\nconsole.log('Generated JWT:', token.split('.')[0] + '...');`,
    outputSnippet: `Generated JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  },
  {
    id: 'oauth',
    category: 'Backend',
    name: 'OAuth 2.0',
    icon: <FaShieldAlt />,
    color: '#4285F4',
    fileName: 'oauth.js',
    runCommand: 'node oauth.js',
    codeSnippet: `const { OAuth2Client } = require('google-auth-library');\nconst client = new OAuth2Client(CLIENT_ID);\n\nasync function verify(token) {\n  const ticket = await client.verifyIdToken({\n      idToken: token,\n      audience: CLIENT_ID,\n  });\n  const payload = ticket.getPayload();\n  console.log("Authenticated User:", payload.email);\n}`,
    outputSnippet: `Exchanging auth code for tokens...\nAuthenticated User: abhishek@example.com\nAccess Token: ya29.a0AfB...`
  },

  // Frontend
  {
    id: 'react',
    category: 'Frontend',
    name: 'React.js',
    icon: <FaReact />,
    color: '#61dafb',
    fileName: 'App.jsx',
    runCommand: 'npm run dev',
    codeSnippet: `import { useState, useEffect } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}`,
    outputSnippet: ``,
    visualOutput: (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#282c34', padding: '1.5rem', borderRadius: '12px', border: '1px solid #444' }}>
        <FaReact style={{ color: '#61dafb', fontSize: '2rem', animation: 'spin 4s linear infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>Interactive Preview</span>
          <button style={{ background: '#61dafb', color: '#000', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Count: 1
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'tailwind',
    category: 'Frontend',
    name: 'Tailwind CSS',
    icon: <FaPalette />,
    color: '#38b2ac',
    fileName: 'Card.jsx',
    runCommand: 'npx tailwindcss -o out.css',
    codeSnippet: `export const Card = () => (\n  <div className="p-4 bg-white/10 rounded-xl shadow-lg flex items-center space-x-4 hover:-translate-y-1">\n    <div className="text-xl font-medium text-white">Utility-First</div>\n  </div>\n);`,
    outputSnippet: ``,
    visualOutput: (
      <div style={{ padding: '1rem', background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <FaPalette /> Utility-First Styling
        </div>
      </div>
    )
  },
  {
    id: 'html5',
    category: 'Frontend',
    name: 'HTML5',
    icon: <FaHtml5 />,
    color: '#e34f26',
    fileName: 'index.html',
    runCommand: 'html-linter index.html',
    codeSnippet: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Semantic HTML</title>\n</head>\n<body>\n  <header>...</header>\n  <main>\n    <article>...</article>\n  </main>\n</body>\n</html>`,
    outputSnippet: ``,
    visualOutput: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        <div style={{ background: '#e34f26', height: '20px', borderRadius: '4px', opacity: 0.8 }} title="<header>"></div>
        <div style={{ display: 'flex', gap: '4px', height: '60px' }}>
          <div style={{ background: '#e34f26', flex: 3, borderRadius: '4px', opacity: 0.6 }} title="<main>"></div>
          <div style={{ background: '#e34f26', flex: 1, borderRadius: '4px', opacity: 0.4 }} title="<aside>"></div>
        </div>
        <div style={{ background: '#e34f26', height: '15px', borderRadius: '4px', opacity: 0.8 }} title="<footer>"></div>
      </div>
    )
  },
  {
    id: 'css3',
    category: 'Frontend',
    name: 'CSS3',
    icon: <FaCss3Alt />,
    color: '#1572b6',
    fileName: 'styles.css',
    runCommand: 'npm run build:css',
    codeSnippet: `.glass-morphism {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 12px;\n}`,
    outputSnippet: ``,
    visualOutput: (
      <div style={{ background: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600) center/cover', padding: '2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', padding: '1rem 2rem', borderRadius: '12px', color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Glassmorphism Preview
        </div>
      </div>
    )
  },

  // Databases & Caching
  {
    id: 'mongodb',
    category: 'Databases & Caching',
    name: 'MongoDB',
    icon: <FaLeaf />,
    color: '#47a248',
    fileName: 'query.js',
    runCommand: 'mongosh --eval "load(\'query.js\')"',
    codeSnippet: `db.collection('users').createIndex({ "location": "2dsphere" });\n\ndb.collection('users').find({\n  location: {\n    $near: {\n      $geometry: { type: "Point" , coordinates: [ -73.9667, 40.78 ] },\n      $maxDistance: 5000\n    }\n  }\n});`,
    outputSnippet: `Index build completed.\nFound 4 documents within 5km radius.`
  },
  {
    id: 'mysql',
    category: 'Databases & Caching',
    name: 'MySQL',
    icon: <FaDatabase />,
    color: '#4479a1',
    fileName: 'schema.sql',
    runCommand: 'mysql -u root < schema.sql',
    codeSnippet: `CREATE TABLE orders (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    user_id INT NOT NULL,\n    total DECIMAL(10, 2) NOT NULL,\n    INDEX (user_id),\n    FOREIGN KEY (user_id) REFERENCES users(id)\n);`,
    outputSnippet: `Query OK, 0 rows affected (0.04 sec)`
  },
  {
    id: 'redis',
    category: 'Databases & Caching',
    name: 'Redis',
    icon: <FaMemory />,
    color: '#dc382d',
    fileName: 'cache.js',
    runCommand: 'node cache.js',
    codeSnippet: `const redis = require('redis');\nconst client = redis.createClient();\n\nawait client.connect();\nawait client.setEx('user:123:session', 3600, JSON.stringify({ active: true }));\n\nconst session = await client.get('user:123:session');\nconsole.log('Cache Hit:', session);`,
    outputSnippet: `Connected to Redis on 127.0.0.1:6379\nCache Hit: {"active":true}`
  },

  // DevOps & Cloud
  {
    id: 'docker',
    category: 'DevOps & Cloud',
    name: 'Docker',
    icon: <FaDocker />,
    color: '#2496ed',
    fileName: 'Dockerfile',
    runCommand: 'docker build -t app .',
    codeSnippet: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]`,
    outputSnippet: `=> [internal] load build definition   0.1s\n=> => naming to docker.io/library/app 0.1s\nDONE`
  },
  {
    id: 'git',
    category: 'DevOps & Cloud',
    name: 'Git',
    icon: <FaGitAlt />,
    color: '#f34f29',
    fileName: 'terminal',
    runCommand: 'git rebase -i HEAD~3',
    codeSnippet: `pick e123456 feat: add user auth\nsquash a987654 fix: auth bug\npick b345678 doc: update readme\n\n# Rebase completed successfully`,
    outputSnippet: `Successfully rebased and updated refs/heads/main.`
  },
  {
    id: 'github',
    category: 'DevOps & Cloud',
    name: 'GitHub',
    icon: <FaGithub />,
    color: '#ffffff',
    fileName: 'actions.yml',
    runCommand: 'gh pr create',
    codeSnippet: `name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm test`,
    outputSnippet: `Creating pull request for feature/auth into main\nhttps://github.com/user/repo/pull/42`
  },
  {
    id: 'aws',
    category: 'DevOps & Cloud',
    name: 'AWS',
    icon: <FaAws />,
    color: '#ff9900',
    fileName: 'deploy.sh',
    runCommand: 'aws s3 sync ./dist s3://my-bucket',
    codeSnippet: `aws ec2 run-instances \\\n  --image-id ami-0abcdef1234567890 \\\n  --count 1 \\\n  --instance-type t3.micro \\\n  --key-name MyKeyPair \\\n  --security-group-ids sg-903004f8`,
    outputSnippet: `upload: dist/index.html to s3://my-bucket/index.html\nupload: dist/app.js to s3://my-bucket/app.js`
  },
  {
    id: 'cicd',
    category: 'DevOps & Cloud',
    name: 'CI/CD Pipeline',
    icon: <FaInfinity />,
    color: '#4caf50',
    fileName: 'pipeline.js',
    runCommand: 'trigger-pipeline',
    codeSnippet: `pipeline {\n  agent any\n  stages {\n    stage('Test') {\n      steps { sh 'npm test' }\n    }\n    stage('Deploy') {\n      steps { sh './deploy.sh' }\n    }\n  }\n}`,
    outputSnippet: `[Pipeline] stage (Test) - SUCCESS\n[Pipeline] stage (Deploy) - SUCCESS\nFinished: SUCCESS`
  },
  {
    id: 'postman',
    category: 'DevOps & Cloud',
    name: 'Postman',
    icon: <FaPaperPlane />,
    color: '#ff6c37',
    fileName: 'test.js',
    runCommand: 'newman run collection.json',
    codeSnippet: `pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("Response contains user id", function () {\n    var jsonData = pm.response.json();\n    pm.expect(jsonData.data.id).to.be.a("number");\n});`,
    outputSnippet: `Postman Collection Run:\n✓ Status code is 200\n✓ Response contains user id\n0 failures.`
  },

  // AI & Automation
  {
    id: 'langchain',
    category: 'AI & Automation',
    name: 'LangChain',
    icon: <FaLink />,
    color: '#000000',
    fileName: 'agent.py',
    runCommand: 'python agent.py',
    codeSnippet: `from langchain.agents import initialize_agent, AgentType\nfrom langchain.llms import OpenAI\n\nllm = OpenAI(temperature=0)\ntools = [SearchTool(), CalculatorTool()]\n\nagent = initialize_agent(\n    tools, llm, \n    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,\n    verbose=True\n)\n\nagent.run("What is 20% of AAPL price?")`,
    outputSnippet: `> Entering new AgentExecutor chain...\nObservation: AAPL price is 185.92\nThought: Now calculate 20%.\nObservation: 37.184\n> Finished chain.`
  },
  {
    id: 'gemini',
    category: 'AI & Automation',
    name: 'Gemini API',
    icon: <FaRobot />,
    color: '#4285f4',
    fileName: 'gemini.js',
    runCommand: 'node gemini.js',
    codeSnippet: `const { GoogleGenerativeAI } = require("@google/generative-ai");\n\nconst genAI = new GoogleGenerativeAI(process.env.API_KEY);\nconst model = genAI.getGenerativeModel({ model: "gemini-pro"});\n\nconst prompt = "Explain quantum computing in one sentence.";\nconst result = await model.generateContent(prompt);\nconsole.log(result.response.text());`,
    outputSnippet: `Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.`
  },
  {
    id: 'rag',
    category: 'AI & Automation',
    name: 'RAG',
    icon: <FaSearch />,
    color: '#ff4081',
    fileName: 'retrieval.py',
    runCommand: 'python retrieval.py',
    codeSnippet: `from langchain.vectorstores import Chroma\nfrom langchain.embeddings import OpenAIEmbeddings\n\ndb = Chroma(persist_directory="./chroma_db", embedding_function=OpenAIEmbeddings())\nretriever = db.as_retriever(search_kwargs={"k": 3})\n\ndocs = retriever.get_relevant_documents("How does the system work?")\nprint(f"Retrieved {len(docs)} relevant context chunks.")`,
    outputSnippet: `Loaded Chroma DB from ./chroma_db\nRetrieved 3 relevant context chunks.`
  },
  {
    id: 'openai',
    category: 'AI & Automation',
    name: 'OpenAI API',
    icon: <FaBrain />,
    color: '#10a37f',
    fileName: 'openai.py',
    runCommand: 'python openai.py',
    codeSnippet: `import openai\n\nresponse = openai.ChatCompletion.create(\n  model="gpt-4",\n  messages=[\n    {"role": "system", "content": "You are a helpful assistant."},\n    {"role": "user", "content": "Summarize my logs."}\n  ]\n)\n\nprint(response.choices[0].message.content)`,
    outputSnippet: `API Connection Established.\nResponse: The logs indicate a steady increase in memory usage over the last 2 hours.`
  },
  {
    id: 'ocr',
    category: 'AI & Automation',
    name: 'OCR',
    icon: <FaFileImage />,
    color: '#ff9800',
    fileName: 'extract.py',
    runCommand: 'python extract.py invoice.jpg',
    codeSnippet: `import pytesseract\nfrom PIL import Image\n\ndef extract_text(image_path):\n    img = Image.open(image_path)\n    text = pytesseract.image_to_string(img)\n    return text\n\ncontent = extract_text('invoice.jpg')\nprint(f"Extracted: {content[:20]}...")`,
    outputSnippet: `Processing image invoice.jpg...\nExtracted: TOTAL AMOUNT DUE: $4...`
  }
];

const Skills = () => {
  const [activeSkill, setActiveSkill] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSkillClick = (skill) => {
    if (activeSkill?.id === skill.id) {
      setActiveSkill(null); // toggle off
    } else {
      setActiveSkill(skill);
    }
  };

  // Group skills by category
  const categories = ['Languages', 'Frontend', 'Backend', 'Databases & Caching', 'DevOps & Cloud', 'AI & Automation'];
  const groupedSkills = categories.reduce((acc, cat) => {
    acc[cat] = skillsData.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="skills-container" id="skills">
      <AnimatePresence mode="wait">
        {!activeSkill ? (
          <motion.div 
            key="grouped-grid"
            className="skills-grouped-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {categories.map((category) => (
              groupedSkills[category]?.length > 0 && (
                <div key={category} className="skill-category-section">
                  <h3 className="skill-category-title">{category}</h3>
                  <div className="skills-grid">
                    {groupedSkills[category].map((skill) => (
                      <motion.div
                        key={skill.id}
                        layoutId={`skill-${skill.id}`}
                        className="skill-card-base"
                        onClick={() => handleSkillClick(skill)}
                        onMouseEnter={() => !isMobile && setActiveSkill(skill)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="skill-icon" style={{ color: skill.color }}>
                          {skill.icon}
                        </div>
                        <span className="skill-name" style={{ textAlign: 'center' }}>{skill.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="active-layout"
            className={`skills-active-layout ${isMobile ? 'mobile-stack' : 'desktop-split'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="skills-focus-area">
              <motion.div
                layoutId={`skill-${activeSkill.id}`}
                className="skill-card-active"
                onClick={() => handleSkillClick(activeSkill)}
              >
                <div className="skill-icon-large" style={{ color: activeSkill.color }}>
                  {activeSkill.icon}
                </div>
                <span className="skill-name-large" style={{ textAlign: 'center' }}>{activeSkill.name}</span>
                <div className="skill-close-hint">Click to close</div>
              </motion.div>
            </div>

            <div className="skills-terminal-area">
              <TerminalPanel skill={activeSkill} />
            </div>

            <motion.div 
              className="skills-row-bottom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {skillsData.map((skill) => (
                <motion.div
                  key={skill.id}
                  layoutId={skill.id === activeSkill.id ? 'hidden' : `skill-${skill.id}`}
                  className={`skill-card-mini ${skill.id === activeSkill.id ? 'hidden' : ''}`}
                  onClick={() => handleSkillClick(skill)}
                >
                  <div className="skill-icon-mini" style={{ color: skill.color }} title={skill.name}>
                    {skill.icon}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Skills;
