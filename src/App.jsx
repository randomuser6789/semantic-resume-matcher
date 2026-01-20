import React, { useState } from 'react';
import { FileText, Briefcase, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ResumeJobMatcher = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeMatch = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description');
      return;
    }
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setError('API key not found. Make sure .env file exists with REACT_APP_GEMINI_API_KEY');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a semantic resume analyzer. Analyze the match between this resume and job description.

Resume:
${resume}

Job Description:
${jobDescription}

Output strictly valid JSON matching this schema:
{
  "overallScore": number (0-100),
  "skillsMatch": number (0-100),
  "experienceMatch": number (0-100),
  "qualificationsMatch": number (0-100),
  "strengths": string[],
  "gaps": string[],
  "recommendation": string
}`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (!data.candidates || !data.candidates[0]) {
        throw new Error('No response from API');
      }
      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      console.error('Full error:', err);
      setError(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const loadSampleData = () => {
    setResume(`John Smith
Senior Software Engineer

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 5M+ users
- Mentored team of 5 junior developers
- Implemented CI/CD pipelines reducing deployment time by 60%
- Technologies: Python, Django, PostgreSQL, Docker, Kubernetes

Software Engineer | StartupXYZ | 2018-2020
- Developed RESTful APIs and data processing pipelines
- Collaborated with cross-functional teams on product features
- Technologies: Python, Flask, MongoDB, AWS

EDUCATION
B.S. Computer Science | State University | 2018

SKILLS
Languages: Python, JavaScript, SQL
Frameworks: Django, Flask, React
Cloud: AWS, Docker, Kubernetes
Databases: PostgreSQL, MongoDB, Redis`);
    setJobDescription(`Full Stack Developer

We're seeking a Full Stack Developer to join our growing team.

Requirements:
- 3+ years of software development experience
- Strong proficiency in Python and modern web frameworks
- Experience with cloud platforms (AWS, GCP, or Azure)
- Database design and optimization skills
- Understanding of containerization and orchestration
- Experience with CI/CD practices
- Strong communication and teamwork skills

Responsibilities:
- Design and implement scalable web applications
- Collaborate with product and design teams
- Mentor junior developers
- Contribute to architectural decisions
- Ensure code quality and best practices

Nice to have:
- Experience with React or Vue.js
- Knowledge of microservices architecture
- DevOps experience`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Semantic Resume Matcher
          </h1>
          <p className="text-gray-600">
            Powered by Gemini
          </p>
          <button
            onClick={loadSampleData}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Load sample data
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Resume</h2>
            </div>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste the candidate's resume here..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        </div>
        <div className="text-center mb-6">
          <button
            onClick={analyzeMatch}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Analyzing Match...
              </span>
            ) : (
              'Analyze Match'
            )}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                <span className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Overall Match Score</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Skills Match', score: result.skillsMatch },
                { label: 'Experience Match', score: result.experienceMatch },
                { label: 'Qualifications Match', score: result.qualificationsMatch }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-gray-600 mb-2 font-medium">{item.label}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full ${getScoreBg(item.score)} transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}%
                  </p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Gaps to Address
                </h4>
                <ul className="space-y-2">
                  {result.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-gray-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Recommendation</h4>
              <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeJobMatcher;